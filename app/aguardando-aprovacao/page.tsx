"use client";

import { motion } from "framer-motion";
import { Clock, ShieldCheck, LogOut, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function WaitingPage() {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4 overflow-hidden relative">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-12 text-center shadow-2xl relative overflow-hidden"
        >
          {/* Animated Background Icon */}
          <div className="absolute -top-12 -right-12 opacity-5 scale-150">
            <ShieldCheck size={200} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <div className="w-20 h-20 bg-amber-500/10 rounded-3xl flex items-center justify-center border border-amber-500/20 shadow-2xl shadow-amber-500/5 mb-8 animate-pulse">
              <Clock className="text-amber-500" size={40} />
            </div>

            <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Acesso em Análise</h1>
            
            <p className="text-muted-foreground text-sm uppercase tracking-widest font-bold leading-relaxed mb-10 max-w-xs">
              Sua conta foi vinculada com sucesso, mas o acesso ainda não foi autorizado pelo <span className="text-blue-400">GTAM/GMF</span>.
            </p>

            <div className="space-y-4 w-full">
              <div className="bg-white/5 rounded-2xl p-4 flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest border border-white/5">
                <div className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                <span>Status: Pendente de Liberação</span>
              </div>
              
              <button 
                onClick={handleLogout}
                className="w-full group flex items-center justify-center gap-3 bg-red-600/10 hover:bg-red-600 text-red-500 hover:text-white py-4 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all border border-red-500/20 active:scale-[0.98]"
              >
                <LogOut size={16} />
                Sair da Conta
              </button>
            </div>

            <p className="mt-12 text-[9px] font-black uppercase tracking-[0.3em] text-muted-foreground opacity-30 flex items-center gap-2">
              Segurança Operacional GMF <ChevronRight size={10} /> Escalante Pro
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
