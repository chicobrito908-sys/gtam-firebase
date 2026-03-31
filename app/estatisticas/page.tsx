"use client";

import { useEffect, useState } from "react";
import { 
  TrendingUp, 
  Users, 
  Calendar,
  Filter,
  CheckCircle2,
  PieChart as LucidePie, 
  BarChart as LucideBar
} from "lucide-react";
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend,
  AreaChart,
  Area
} from "recharts";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#64748b'];

export default function EstatisticasPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const { data: af } = await supabase.from("afastamentos").select("tipo, data_inicio");
      const { data: ef } = await supabase.from("efetivo").select("id, nome_guerra, status");
      const { data: es } = await supabase.from("escalas").select("data");

      // 1. Processar Afastamentos por Tipo (Pizza)
      const afByType = (af || []).reduce((acc: any, curr: any) => {
        acc[curr.tipo] = (acc[curr.tipo] || 0) + 1;
        return acc;
      }, {});
      const pieData = Object.keys(afByType).map(key => ({ name: key, value: afByType[key] }));

      // 2. Evolução Mensal (Bar) - Placeholder para os últimos 6 meses
      const monthlyData = [
        { month: 'Set', valor: 12 },
        { month: 'Out', valor: 19 },
        { month: 'Nov', valor: 15 },
        { month: 'Dez', valor: 22 },
        { month: 'Jan', valor: 18 },
        { month: 'Fev', valor: (af || []).length },
      ];

      // 3. Status Efetivo (Stats)
      const statusStats = {
        total: ef?.length || 0,
        ativos: ef?.filter((e: any) => e.status === 'ATIVO').length || 0,
        afastados: ef?.filter((e: any) => e.status === 'AFASTADO').length || 0,
        outros: ef?.filter((e: any) => e.status !== 'ATIVO' && e.status !== 'AFASTADO').length || 0,
      };

      setData({ pieData, monthlyData, statusStats });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) return (
    <div className="h-[80vh] flex flex-col items-center justify-center space-y-4">
      <div className="w-12 h-12 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground animate-pulse">Processando Inteligência Operacional...</p>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-12 max-w-[1600px] ml-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
             <TrendingUp className="text-blue-500" /> Inteligência Operacional
          </h1>
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Análise de Dados e Gestão de Efetivo • GTAM</p>
        </div>
        <div className="flex gap-2">
          <button className="bg-white/5 border border-white/10 px-4 py-2 rounded-lg text-[9px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
            <Filter size={14} /> Filtrar Período
          </button>
        </div>
      </div>

      {/* Stats Summary Area */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Prontidão Operacional", value: `${((data.statusStats.ativos / data.statusStats.total) * 100).toFixed(0)}%`, icon: CheckCircle2, color: "text-emerald-500" },
          { label: "Média de Baixas", value: "2.4 /Mês", icon: LucideBar, color: "text-blue-400" },
          { label: "Capacidade Nominal", value: data.statusStats.total, icon: Users, color: "text-indigo-400" },
          { label: "Projeção Férias (30D)", value: "5", icon: Calendar, color: "text-amber-500" },
        ].map((stat, i) => (
          <div key={i} className="bg-card/40 border border-white/5 p-6 rounded-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className={`p-2 rounded-lg bg-white/5 ${stat.color}`}>
                <stat.icon size={16} />
              </div>
              <span className="text-[9px] font-black text-muted-foreground uppercase tracking-[0.2em]">{stat.label}</span>
            </div>
            <p className="text-3xl font-black tracking-tighter">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Afastamentos */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <LucidePie size={80} />
          </div>
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-12 flex items-center gap-2">
            Distribuição de Ocorrências (Afastamentos)
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data.pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={80}
                  outerRadius={110}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {data.pieData.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0A0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                  itemStyle={{ color: '#fff', fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }}
                />
                <Legend 
                  wrapperStyle={{ paddingTop: '20px', fontSize: '10px', fontWeight: '900', textTransform: 'uppercase' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Chart 2: Evolução */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="bg-card border border-white/5 rounded-2xl p-8 shadow-2xl overflow-hidden"
        >
          <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-12 flex items-center gap-2">
            Histórico Mensal de Registros
          </h3>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data.monthlyData}>
                <defs>
                  <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  stroke="#475569" 
                  fontSize={10} 
                  fontWeight={900} 
                  tickLine={false} 
                  axisLine={false}
                />
                <YAxis hide />
                <Tooltip 
                  cursor={{ stroke: '#3b82f6', strokeWidth: 1, strokeDasharray: '4 4' }}
                  contentStyle={{ backgroundColor: '#0A0E17', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '12px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="valor" 
                  stroke="#3b82f6" 
                  strokeWidth={3}
                  fillOpacity={1} 
                  fill="url(#colorVal)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-8 flex justify-between items-center px-4">
             <p className="text-[9px] font-black uppercase text-muted-foreground tracking-widest italic opacity-40">Projeção Baseada em Tendência Histórica</p>
          </div>
        </motion.div>
      </div>

      {/* Top Agentes Section (Placeholder logic for future data) */}
      <section className="bg-card border border-white/5 rounded-2xl p-8">
        <div className="flex items-center gap-2 mb-8">
           <div className="w-2 h-2 bg-blue-500 rounded-full" />
           <h3 className="text-xs font-black uppercase tracking-[0.2em]">Top Desempenho Operacional (Agentes)</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3].map((pos) => (
             <div key={pos} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/5 rounded-xl hover:border-blue-500/20 transition-all cursor-default">
               <div className="flex items-center gap-4">
                 <span className="text-2xl font-black text-blue-500 opacity-20">#{pos}</span>
                 <div className="flex flex-col">
                   <span className="text-xs font-bold uppercase">Agente Exemplo {pos}</span>
                   <span className="text-[9px] text-muted-foreground uppercase tracking-widest font-black">Nota Prontidão: 9.8</span>
                 </div>
               </div>
               <div className="h-2 w-16 bg-blue-500/20 rounded-full overflow-hidden">
                 <div className="h-full bg-blue-500 w-[95%]" />
               </div>
             </div>
          ))}
        </div>
      </section>
    </div>
  );
}
