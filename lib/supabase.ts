"use client";

import {
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
} from "firebase/firestore";
import { auth, db, googleProvider, toSession } from "@/lib/firebase";

type FilterOperator = "eq" | "gte" | "lte";

type Filter = {
  field: string;
  operator: FilterOperator;
  value: unknown;
};

type OrderByClause = {
  field: string;
  ascending: boolean;
};

const RELATION_REGEX = /(\w+):(\w+)\(([^)]+)\)/g;

function normalizeValue(value: unknown): unknown {
  if (
    value &&
    typeof value === "object" &&
    "toDate" in (value as Record<string, unknown>) &&
    typeof (value as { toDate: () => Date }).toDate === "function"
  ) {
    return (value as { toDate: () => Date }).toDate().toISOString();
  }

  if (Array.isArray(value)) {
    return value.map(normalizeValue);
  }

  if (value && typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value as Record<string, unknown>).map(([key, nested]) => [
        key,
        normalizeValue(nested),
      ])
    );
  }

  return value;
}

function compareValues(left: unknown, right: unknown): number {
  if (left === right) {
    return 0;
  }

  if (left == null) {
    return -1;
  }

  if (right == null) {
    return 1;
  }

  return String(left).localeCompare(String(right), "pt-BR", {
    numeric: true,
    sensitivity: "base",
  });
}

function matchesFilter(record: Record<string, unknown>, filter: Filter) {
  const current = record[filter.field];
  const target = filter.value;

  switch (filter.operator) {
    case "eq":
      return current === target;
    case "gte":
      return compareValues(current, target) >= 0;
    case "lte":
      return compareValues(current, target) <= 0;
    default:
      return false;
  }
}

function splitFields(selection: string) {
  return selection
    .split(",")
    .map((field) => field.trim())
    .filter(Boolean);
}

async function ensureUserProfile(user: User) {
  const ref = doc(db, "usuarios", user.uid);
  const existing = await getDoc(ref);
  const now = new Date().toISOString();

  const baseProfile = {
    email: user.email,
    nome: user.displayName || user.email?.split("@")[0] || "Usuário",
    foto_url: user.photoURL,
    status: "PENDENTE",
    nivel: "operador",
    updated_at: now,
  };

  if (!existing.exists()) {
    await setDoc(ref, {
      ...baseProfile,
      created_at: now,
    });
    return;
  }

  await setDoc(ref, baseProfile, { merge: true });
}

async function readCollection(collectionName: string) {
  const snapshot = await getDocs(query(collection(db, collectionName)));
  return snapshot.docs.map((item) => {
    const data = normalizeValue(item.data()) as Record<string, unknown>;
    return {
      id: item.id,
      ...data,
    };
  }) as Record<string, unknown>[];
}

async function applyRelations(
  rows: Record<string, unknown>[],
  selection: string
) {
  const relationClauses = Array.from(selection.matchAll(RELATION_REGEX));

  if (relationClauses.length === 0) {
    return rows;
  }

  const cache = new Map<string, Map<string, Record<string, unknown>>>();

  for (const [, alias] of relationClauses) {
    if (!cache.has(alias)) {
      const docs = await readCollection(alias);
      cache.set(alias, new Map(docs.map((entry) => [String(entry.id), entry])));
    }
  }

  return rows.map((row) => {
    const enriched = { ...row };

    for (const [, alias, foreignKey, fields] of relationClauses) {
      const foreignId = row[foreignKey];
      const related = cache.get(alias)?.get(String(foreignId));

      if (!related) {
        enriched[alias] = null;
        continue;
      }

      enriched[alias] = Object.fromEntries(
        splitFields(fields).map((field) => [field, related[field]])
      );
    }

    return enriched;
  });
}

function applyProjection(rows: Record<string, unknown>[], selection: string) {
  if (!selection || selection === "*") {
    return rows;
  }

  const strippedSelection = selection.replace(RELATION_REGEX, "").replace(/,,+/g, ",");
  const requestedFields = splitFields(strippedSelection).filter((field) => field !== "*");
  const relationAliases = Array.from(selection.matchAll(RELATION_REGEX)).map((match) => match[1]);

  return rows.map((row) => {
    const projected =
      requestedFields.length === 0
        ? { ...row }
        : Object.fromEntries(requestedFields.map((field) => [field, row[field]]));

    for (const alias of relationAliases) {
      projected[alias] = row[alias];
    }

    if (!("id" in projected) && "id" in row) {
      projected.id = row.id;
    }

    return projected;
  });
}

class FirebaseQueryBuilder<T = unknown>
  implements PromiseLike<{ data: T; error: Error | null }>
{
  private mode: "select" | "update" | "delete" = "select";
  private selection = "*";
  private filters: Filter[] = [];
  private orderByClause: OrderByClause | null = null;
  private expectSingle = false;
  private updatePayload: Record<string, unknown> | null = null;

  constructor(private readonly collectionName: string) {}

  select(selection = "*") {
    this.mode = "select";
    this.selection = selection;
    return this;
  }

  update(payload: Record<string, unknown>) {
    this.mode = "update";
    this.updatePayload = payload;
    return this;
  }

  delete() {
    this.mode = "delete";
    return this;
  }

  eq(field: string, value: unknown) {
    this.filters.push({ field, operator: "eq", value });
    return this;
  }

  gte(field: string, value: unknown) {
    this.filters.push({ field, operator: "gte", value });
    return this;
  }

  lte(field: string, value: unknown) {
    this.filters.push({ field, operator: "lte", value });
    return this;
  }

  order(field: string, options?: { ascending?: boolean }) {
    this.orderByClause = {
      field,
      ascending: options?.ascending ?? true,
    };
    return this;
  }

  single() {
    this.expectSingle = true;
    return this;
  }

  insert(rows: Record<string, unknown>[]) {
    return insertRows(this.collectionName, rows);
  }

  upsert(rows: Record<string, unknown>[], options?: { onConflict?: string }) {
    return upsertRows(this.collectionName, rows, options);
  }

  private async execute() {
    try {
      const rows = await readCollection(this.collectionName);
      const filtered = rows.filter((row) =>
        this.filters.every((filter) => matchesFilter(row, filter))
      );

      if (this.orderByClause) {
        filtered.sort((left, right) => {
          const result = compareValues(
            left[this.orderByClause!.field],
            right[this.orderByClause!.field]
          );
          return this.orderByClause!.ascending ? result : -result;
        });
      }

      if (this.mode === "select") {
        const joined = await applyRelations(filtered, this.selection);
        const projected = applyProjection(joined, this.selection);
        return {
          data: (this.expectSingle ? projected[0] ?? null : projected) as T,
          error: null,
        };
      }

      if (this.mode === "update") {
        const now = new Date().toISOString();

        for (const row of filtered) {
          await setDoc(
            doc(db, this.collectionName, String(row.id)),
            {
              ...this.updatePayload,
              updated_at: now,
            },
            { merge: true }
          );
        }

        return {
          data: null as T,
          error: null,
        };
      }

      for (const row of filtered) {
        await deleteDoc(doc(db, this.collectionName, String(row.id)));
      }

      return {
        data: null as T,
        error: null,
      };
    } catch (error) {
      return {
        data: null as T,
        error: error instanceof Error ? error : new Error("Erro inesperado no Firebase"),
      };
    }
  }

  then<TResult1 = { data: T; error: Error | null }, TResult2 = never>(
    onfulfilled?:
      | ((value: { data: T; error: Error | null }) => TResult1 | PromiseLike<TResult1>)
      | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null
  ) {
    return this.execute().then(onfulfilled, onrejected);
  }
}

async function insertRows(collectionName: string, rows: Record<string, unknown>[]) {
  try {
    const now = new Date().toISOString();

    for (const row of rows) {
      await addDoc(collection(db, collectionName), {
        ...row,
        created_at: row.created_at ?? now,
        updated_at: now,
      });
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Erro ao inserir documento"),
    };
  }
}

async function upsertRows(
  collectionName: string,
  rows: Record<string, unknown>[],
  options?: { onConflict?: string }
) {
  try {
    const conflictFields =
      options?.onConflict
        ?.split(",")
        .map((field) => field.trim())
        .filter(Boolean) ?? [];
    const existing = await readCollection(collectionName);
    const now = new Date().toISOString();

    for (const row of rows) {
      const match = existing.find((entry) =>
        conflictFields.every((field) => entry[field] === row[field])
      );

      if (match) {
        await setDoc(
          doc(db, collectionName, String(match.id)),
          {
            ...row,
            updated_at: now,
          },
          { merge: true }
        );
        continue;
      }

      await addDoc(collection(db, collectionName), {
        ...row,
        created_at: row.created_at ?? now,
        updated_at: now,
      });
    }

    return {
      data: null,
      error: null,
    };
  } catch (error) {
    return {
      data: null,
      error: error instanceof Error ? error : new Error("Erro ao executar upsert"),
    };
  }
}

export const supabase = {
  auth: {
    onAuthStateChange(
      callback: (event: string, session: ReturnType<typeof toSession>) => void
    ) {
      let previousUid = auth.currentUser?.uid ?? null;

      const unsubscribe = onAuthStateChanged(auth, (user) => {
        const currentUid = user?.uid ?? null;
        const event =
          currentUid && !previousUid
            ? "SIGNED_IN"
            : !currentUid && previousUid
              ? "SIGNED_OUT"
              : "TOKEN_REFRESHED";

        previousUid = currentUid;
        callback(event, toSession(user));
      });

      return {
        data: {
          subscription: {
            unsubscribe,
          },
        },
      };
    },

    async signInWithOAuth({ provider }: { provider: string; options?: { redirectTo?: string } }) {
      try {
        if (provider !== "google") {
          throw new Error(`Provider não suportado na migração Firebase: ${provider}`);
        }

        const result = await signInWithPopup(auth, googleProvider);
        await ensureUserProfile(result.user);

        return {
          data: {
            session: toSession(result.user),
          },
          error: null,
        };
      } catch (error) {
        return {
          data: {
            session: null,
          },
          error: error instanceof Error ? error : new Error("Falha no login com Google"),
        };
      }
    },

    async signOut() {
      try {
        await signOut(auth);
        return { error: null };
      } catch (error) {
        return {
          error: error instanceof Error ? error : new Error("Falha ao encerrar sessão"),
        };
      }
    },

    async getSession() {
      return {
        data: {
          session: toSession(auth.currentUser),
        },
        error: null,
      };
    },
  },

  from(collectionName: string) {
    return new FirebaseQueryBuilder<any>(collectionName);
  },
};
