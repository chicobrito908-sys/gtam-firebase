"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Sidebar from "@/components/Sidebar";
import { AuthProvider, useAuth } from "@/components/AuthProvider";
import { supabase } from "@/lib/supabase";

const LOGIN_ROUTE = "/login";
const WAITING_ROUTE = "/aguardando-aprovacao";
const PUBLIC_ROUTES = new Set([LOGIN_ROUTE]);

function AppShellContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  const isPublicRoute = PUBLIC_ROUTES.has(pathname);
  const isWaitingRoute = pathname === WAITING_ROUTE;
  const isActive = profile?.status === "ATIVO";
  const isPending = profile?.status === "PENDENTE";
  const isBlocked = profile?.status === "BLOQUEADO";
  const hasKnownStatus = isActive || isPending || isBlocked;
  const shouldShowSidebar = !isPublicRoute && !isWaitingRoute && !!user && isActive;

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!user) {
      if (!isPublicRoute) {
        router.replace(LOGIN_ROUTE);
      }
      return;
    }

    if (isBlocked) {
      supabase.auth.signOut().finally(() => {
        router.replace(LOGIN_ROUTE);
      });
      return;
    }

    if (isPending && !isWaitingRoute) {
      router.replace(WAITING_ROUTE);
      return;
    }

    if (isActive && (isPublicRoute || isWaitingRoute)) {
      router.replace("/");
    }
  }, [isActive, isBlocked, isPending, isPublicRoute, isWaitingRoute, loading, router, user]);

  if (loading || (!user && !isPublicRoute) || (user && isPending && !isWaitingRoute)) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-black tracking-[0.2em] uppercase text-muted-foreground">
            Validando acesso...
          </p>
        </div>
      </div>
    );
  }

  if (user && !profile && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-amber-500/20 bg-amber-500/10 p-8 text-center">
          <p className="text-xl font-black uppercase tracking-widest text-white mb-3">
            Perfil ainda nao localizado
          </p>
          <p className="text-sm font-bold uppercase tracking-wide text-amber-100/80 mb-6">
            O login Firebase foi reconhecido, mas o documento do usuario em "usuarios" nao foi carregado.
          </p>
          <p className="text-xs font-mono text-amber-200/70 mb-6">{user.email || user.uid}</p>
          <div className="flex items-center justify-center gap-3">
            <button
              onClick={() => router.refresh()}
              className="rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all"
            >
              Recarregar
            </button>
            <button
              onClick={() => {
                supabase.auth.signOut().finally(() => {
                  router.replace(LOGIN_ROUTE);
                });
              }}
              className="rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 px-5 py-3 text-xs font-black uppercase tracking-widest text-rose-200 transition-all"
            >
              Sair
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (user && profile && !hasKnownStatus && !isPublicRoute) {
    return (
      <div className="min-h-screen bg-[#0A0E17] flex items-center justify-center p-6">
        <div className="w-full max-w-xl rounded-3xl border border-blue-500/20 bg-blue-500/10 p-8 text-center">
          <p className="text-xl font-black uppercase tracking-widest text-white mb-3">
            Status de acesso nao reconhecido
          </p>
          <p className="text-sm font-bold uppercase tracking-wide text-blue-100/80 mb-4">
            O usuario existe, mas o campo "status" nao esta em ATIVO, PENDENTE ou BLOQUEADO.
          </p>
          <p className="text-xs font-mono text-blue-200/70">status atual: {String(profile.status || "(vazio)")}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen">
      {shouldShowSidebar ? <Sidebar /> : null}
      <main className={`flex-1 transition-all duration-300 ${shouldShowSidebar ? "lg:ml-64" : ""}`}>
        <div className="p-4 md:p-8 max-w-[1600px] mx-auto">{children}</div>
      </main>
    </div>
  );
}

export default function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <AppShellContent>{children}</AppShellContent>
    </AuthProvider>
  );
}
