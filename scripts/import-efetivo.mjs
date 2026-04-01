import fs from "node:fs/promises";
import path from "node:path";
import { initializeApp } from "firebase/app";
import { collection, doc, getDocs, getFirestore, setDoc } from "firebase/firestore";

function parseEnvFile(content) {
  return Object.fromEntries(
    content
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith("#"))
      .map((line) => {
        const index = line.indexOf("=");
        return [line.slice(0, index), line.slice(index + 1)];
      })
  );
}

function parseCsvLine(line) {
  const result = [];
  let current = "";
  let quoted = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];

    if (char === '"') {
      if (quoted && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        quoted = !quoted;
      }
      continue;
    }

    if (char === "," && !quoted) {
      result.push(current);
      current = "";
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function normalizeHeader(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "_")
    .replace(/[^\w]/g, "")
    .toLowerCase();
}

function normalizeEscala(value) {
  const normalized = String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/\s+/g, "");

  if (normalized.includes("24X72")) return "24x72";
  if (normalized.includes("2X2")) return "2x2";
  return String(value || "").trim();
}

function normalizeText(value) {
  return String(value || "").trim();
}

async function main() {
  const csvPath = process.argv[2];

  if (!csvPath) {
    throw new Error("Informe o caminho do CSV. Ex: node scripts/import-efetivo.mjs C:\\arquivo.csv");
  }

  const envPath = path.resolve(".env.local");
  const envContent = await fs.readFile(envPath, "utf8");
  const env = parseEnvFile(envContent);

  const firebaseConfig = {
    apiKey: env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: env.NEXT_PUBLIC_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  const db = getFirestore(app);

  const csvContent = await fs.readFile(csvPath, "utf8");
  const lines = csvContent.split(/\r?\n/).filter(Boolean);

  if (lines.length < 2) {
    throw new Error("CSV vazio ou sem linhas de dados.");
  }

  const headers = parseCsvLine(lines[0]).map(normalizeHeader);
  const records = lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });

  const existingSnapshot = await getDocs(collection(db, "efetivo"));
  const existingByName = new Map();

  for (const item of existingSnapshot.docs) {
    const data = item.data();
    const key = normalizeText(data.nome_completo || data.nome_guerra).toUpperCase();
    if (key) existingByName.set(key, item.id);
  }

  let imported = 0;

  for (const record of records) {
    const antiguidade = Number(record.antiguidade || imported + 1);
    const nomeCompleto = normalizeText(record.nome_completo);
    const nomeGuerra = normalizeText(record.nome_de_guerra);
    const key = (nomeCompleto || nomeGuerra).toUpperCase();
    const docId = existingByName.get(key) || `efetivo-${String(antiguidade).padStart(3, "0")}`;

    const payload = {
      antiguidade,
      nome_completo: nomeCompleto,
      nome_guerra: nomeGuerra,
      matricula: normalizeText(record.matricula),
      posto_grad: normalizeText(record.posto_grad) || normalizeText(record.postograd) || "GM",
      tipo_escala: normalizeEscala(record.escala),
      grupo_turno: normalizeText(record.turno),
      status: "ATIVO",
      servicos_04_count: Number(record.funcao_04 || 0),
      total_atestados: Number(record.total_de_atestados || 0),
      updated_at: new Date().toISOString(),
    };

    await setDoc(
      doc(db, "efetivo", docId),
      {
        ...payload,
        created_at: new Date().toISOString(),
      },
      { merge: true }
    );

    imported += 1;
  }

  console.log(`Importacao concluida: ${imported} registros processados.`);
}

main().catch((error) => {
  console.error("Falha na importacao:", error);
  process.exit(1);
});
