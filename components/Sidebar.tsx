"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Users,
  Settings,
  Calendar,
  LogOut,
  LayoutDashboard,
  Shield,
  Clock,
  ArrowRight,
  Briefcase,
  Palmtree,
  PieChart,
  Menu,
  X
} from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "@/lib/supabase";

const categories = [
  {
    title: "PRINCIPAL",
    items: [
      { name: "Dashboard", href: "/", icon: LayoutDashboard },
      { name: "Efetivo", href: "/efetivo", icon: Users },
    ]
  },
  {
    title: "GESTÃO",
    items: [
      { name: "Escalas", href: "/escalas", icon: Calendar },
      { name: "Plantões", icon: Shield, href: "/plantoes" },
    ]
  },
  {
    title: "OCORRÊNCIAS",
    items: [
      { name: "Afastamentos", icon: Briefcase, href: "/afastamentos" },
      { name: "Férias", icon: Palmtree, href: "/ferias" },
      { name: "Faltas", icon: Shield, href: "/faltas" },
      { name: "Banco de Horas", icon: Clock, href: "/banco-horas" },
      { name: "Estatísticas", icon: PieChart, href: "/estatisticas" },
    ]
  },
  {
    title: "ADMINISTRAÇÃO",
    items: [
      { name: "Usuários", href: "/usuarios", icon: Settings },
    ]
  }
];

export default function Sidebar() {
  const pathname = usePathname();
  const [time, setTime] = useState(new Date());
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/login";
  };

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 left-4 z-50 p-3 bg-blue-600 rounded-xl text-white shadow-lg lg:hidden hover:bg-blue-500 transition-all border border-blue-400/20 active:scale-95"
      >
        <Menu size={20} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <aside className={`
        fixed left-0 top-0 h-screen w-64 bg-[#0d1117] border-r border-white/5 flex flex-col z-50
        transition-transform duration-300 ease-in-out
        ${isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
      `}>
        <div className="p-6 border-b border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 flex items-center justify-center shrink-0">
              <Image
                src="/logo-gtam.png"
                alt="GTAM Logo"
                width={48}
                height={48}
                className="object-contain w-full h-full"
              />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white uppercase">Escalante Pro</h2>
              <p className="text-xs text-primary font-extrabold tracking-widest uppercase opacity-70">GTAM GMF</p>
            </div>
          </div>
          <button onClick={() => setIsOpen(false)} className="lg:hidden p-2 text-muted-foreground">
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 py-4 overflow-y-auto custom-scrollbar scroll-smooth">
          {categories.map((cat) => (
            <div key={cat.title} className="mb-6">
              <h3 className="px-6 text-sm font-black text-muted-foreground/40 tracking-[0.2em] mb-3 uppercase select-none">{cat.title}</h3>
              <div className="space-y-1 px-3">
                {cat.items.map((item) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link
                      key={item.name}
                      href={item.href || "#"}
                      className={`
                        flex items-center gap-4 px-5 py-3 rounded-xl text-sm font-black uppercase tracking-wider transition-all
                        ${isActive
                          ? "bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_rgba(124,58,237,0.1)]"
                          : "text-muted-foreground hover:bg-white/[0.03] hover:text-white"
                        }
                      `}
                    >
                      <item.icon size={18} className={isActive ? "text-primary" : "text-muted-foreground/60"} />
                      <span className="truncate">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-white/5 bg-black/20 mt-auto">
          <div className="mb-6">
            <p className="text-3xl font-black tracking-tighter text-white tabular-nums mb-1">
              {time.getHours().toString().padStart(2, "0")}:{time.getMinutes().toString().padStart(2, "0")}
            </p>
            <div className="flex flex-col">
              <span className="text-xs uppercase font-black text-primary/60 tracking-[0.2em]">
                {time.toLocaleDateString("pt-BR", { weekday: "long" }).toUpperCase()}
              </span>
              <span className="text-[11px] uppercase font-bold text-muted-foreground/40 tracking-widest mt-0.5">
                {time.toLocaleDateString("pt-BR", { day: "2-digit", month: "long" }).toUpperCase()}
              </span>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-between px-5 py-4 bg-rose-500/5 hover:bg-rose-500/10 text-rose-500 rounded-2xl transition-all group font-black text-xs uppercase tracking-[0.1em] border border-rose-500/10"
          >
            <div className="flex items-center gap-3">
              <LogOut size={18} />
              <span>Sair do Sistema</span>
            </div>
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </aside>
    </>
  );
}
