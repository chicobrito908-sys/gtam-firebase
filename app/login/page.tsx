"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Lock, Eye } from "lucide-react";
import Image from "next/image";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Escutar mudanças de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        console.log("Sessão detectada, redirecionando...");
        router.push('/');
        router.refresh();
      }
    });

    return () => subscription.unsubscribe();
  }, [router]);

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      });
      if (error) throw error;
    } catch (error: any) {
      alert("Erro ao iniciar login: " + error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden relative">
      {/* Background Decor */}
      <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-rose-600/10 rounded-full blur-[120px] animate-pulse delay-700" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md relative"
      >
        {/* Card */}
        <div className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] overflow-hidden shadow-2xl">
          {/* Top Banner */}
          <div className="bg-gradient-to-br from-[#0d1117] to-[#1a1040] p-10 flex flex-col items-center text-center border-b border-white/5">
            <div className="w-32 h-32 flex items-center justify-center mb-6">
              <Image
                src="/logo-gtam.png"
                alt="Logo GTAM"
                width={128}
                height={128}
                className="object-contain"
                priority
              />
            </div>
            <h1 className="text-3xl font-black text-white uppercase tracking-tighter">Escalante Pro</h1>
            <p className="text-white/30 text-xs font-bold uppercase tracking-[0.2em] mt-2">GMF • Intranet Operacional</p>
          </div>

          <div className="p-10 space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-bold text-foreground">Acesso Restrito</h2>
              <p className="text-sm text-muted-foreground">Sistema exclusivo para o efetivo do GTAM/GMF. Utilize sua conta institucional.</p>
            </div>

            <button 
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full group relative flex items-center justify-center gap-4 bg-white hover:bg-zinc-100 text-black py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:scale-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span>Entrar com Google</span>
                </>
              )}
            </button>

            <div className="flex items-center gap-4 py-2">
              <div className="h-px bg-white/5 flex-1" />
              <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest opacity-40">Segurança de Dados</span>
              <div className="h-px bg-white/5 flex-1" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                <Lock className="text-blue-500/40" size={16} />
                <span className="text-[9px] font-bold text-muted-foreground uppercase text-center leading-tight">Criptografia Ponta-a-Ponta</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 rounded-3xl bg-white/[0.02] border border-white/5">
                <Eye className="text-rose-500/40" size={16} />
                <span className="text-[9px] font-bold text-muted-foreground uppercase text-center leading-tight">Monitoramento Biométrico</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[10px] font-black uppercase tracking-[0.25em] text-muted-foreground opacity-40">
          Escalante Pro v2.0 • GMF • GTAM • 2026
        </p>
      </motion.div>
    </div>
  );
}
