"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Erro capturado pela rota:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-[#0A0E17] text-white flex items-center justify-center p-6">
      <div className="w-full max-w-2xl rounded-3xl border border-rose-500/20 bg-rose-500/10 p-8 text-center">
        <AlertTriangle className="mx-auto mb-4 text-rose-400" size={40} />
        <h1 className="text-2xl font-black uppercase tracking-widest mb-3">Erro na aplicacao</h1>
        <p className="text-sm font-bold uppercase tracking-wide text-rose-100/80 mb-6">
          {error.message || "Ocorreu uma falha inesperada ao abrir esta tela."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/10 px-5 py-3 text-xs font-black uppercase tracking-widest transition-all"
        >
          <RefreshCcw size={16} />
          Tentar novamente
        </button>
      </div>
    </div>
  );
}
