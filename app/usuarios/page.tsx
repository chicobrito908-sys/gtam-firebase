"use client";

import { useEffect, useState } from "react";
import { 
  Users, 
  ShieldCheck, 
  UserPlus, 
  Search, 
  CheckCircle2, 
  RefreshCw,
  Mail,
  MoreVertical,
  MinusCircle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

interface Usuario {
  id: string;
  nome: string | null;
  email: string;
  status: string;
  nivel: string;
  created_at: string;
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("usuarios")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setUsers((data as Usuario[]) || []);
    } catch (error) {
      console.error("Erro ao buscar usuários:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from("usuarios")
        .update({ status: newStatus })
        .eq("id", id);

      if (error) throw error;
      fetchUsers();
    } catch (error) {
      alert("Erro ao atualizar status: " + (error instanceof Error ? error.message : "Erro desconhecido"));
    }
  };

  const filteredUsers = users.filter(u => 
    u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pl-4 py-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-lg shadow-primary/5">
            <UserPlus className="text-primary" size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-black uppercase tracking-tighter text-foreground">Gestão de Acessos</h1>
            <p className="text-sm text-muted-foreground uppercase tracking-widest font-bold opacity-60">Segurança / Aprovação de Usuários</p>
          </div>
        </div>

        <button 
          onClick={fetchUsers}
          className="p-3 bg-card border border-white/5 rounded-xl text-muted-foreground hover:text-white transition-all shadow-lg active:scale-95"
        >
          <RefreshCw size={18} className={loading ? "animate-spin" : ""} />
        </button>
      </div>

      {/* Search Bar */}
      <div className="relative max-w-md group px-2">
        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" size={16} />
        <input 
          type="text"
          placeholder="Filtrar por nome ou e-mail..."
          className="w-full bg-card border border-white/5 rounded-xl pl-12 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/30 transition-all outline-none"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* User Table */}
      <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-2xl relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#090b10] border-b border-white/5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                <th className="px-6 py-4">Usuário / Google Auth</th>
                <th className="px-6 py-4">Status de Acesso</th>
                <th className="px-6 py-4">Nível</th>
                <th className="px-6 py-4">Data Registro</th>
                <th className="px-6 py-4 text-right">Ações de Admin</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/[0.02]">
              <AnimatePresence>
                {filteredUsers.map((user, idx) => (
                  <motion.tr 
                    key={user.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="hover:bg-white/[0.01] group transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center border border-primary/10 text-primary text-xs font-black">
                          {user.nome ? user.nome.charAt(0) : <Users size={16} />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-bold text-foreground">
                            {user.nome || "Usuário Pendente"}
                          </span>
                          <span className="text-[9px] text-muted-foreground flex items-center gap-1 font-medium">
                            <Mail size={10} /> {user.email}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <span className={`text-[9px] font-black px-3 py-1 rounded-full border uppercase tracking-widest ${
                          user.status === 'ATIVO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                          user.status === 'PENDENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                          'bg-rose-500/10 text-rose-500 border-rose-500/10'
                        }`}>
                          {user.status}
                        </span>
                        {user.status === 'PENDENTE' && (
                          <div className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[10px] font-black uppercase tracking-tighter opacity-40">
                        {user.nivel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {user.status !== 'ATIVO' && (
                          <button 
                            onClick={() => updateStatus(user.id, 'ATIVO')}
                            className="bg-emerald-600/10 hover:bg-emerald-600 text-emerald-500 hover:text-white px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all border border-emerald-500/20 active:scale-95"
                          >
                            Aprovar
                          </button>
                        )}
                        {user.status === 'ATIVO' && user.nivel !== 'admin' && (
                          <button 
                            onClick={() => updateStatus(user.id, 'BLOQUEADO')}
                            className="p-2 hover:bg-rose-500/10 rounded-lg text-muted-foreground hover:text-rose-500 transition-all opacity-0 group-hover:opacity-100"
                            title="Bloquear Acesso"
                          >
                            <MinusCircle size={16} />
                          </button>
                        )}
                        <button className="p-2 text-muted-foreground/30 hover:text-white group-hover:opacity-100 opacity-0 transition-opacity">
                          <MoreVertical size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {filteredUsers.length === 0 && !loading && (
            <div className="p-20 text-center flex flex-col items-center justify-center opacity-30">
              <ShieldCheck size={48} className="mb-4 text-muted-foreground" />
              <p className="text-sm font-black uppercase tracking-widest">Nenhum acesso para validar</p>
            </div>
          )}
        </div>
      </div>

      {/* Info Card */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center border border-amber-500/10">
            <CheckCircle2 className="text-amber-500" size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest">Controle de Fluxo</h4>
            <p className="text-[10px] text-muted-foreground uppercase opacity-60">Todos os novos logins Google são bloqueados por padrão até sua ação.</p>
          </div>
        </div>
        <div className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center border border-primary/10">
            <ShieldCheck className="text-primary" size={20} />
          </div>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-widest">Nível de Serviço</h4>
            <p className="text-[10px] text-muted-foreground uppercase opacity-60">Acesso tático permitido apenas para usuários com e-mail institucional validado.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
