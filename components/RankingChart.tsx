"use client";

import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Cell
} from 'recharts';

const data = [
  { name: 'Comandante', score: 95 },
  { name: 'Sgt Xavier', score: 88 },
  { name: 'Cabo Lima', score: 82 },
  { name: 'Sgt Rocha', score: 75 },
  { name: 'GMF Silva', score: 70 },
];

const COLORS = ['#5b5dfa', '#8b5cf6', '#d946ef', '#3b82f6', '#10b981'];

export default function RankingChart() {
  return (
    <div className="w-full h-[400px] p-6 bg-card border border-white/5 rounded-2xl shadow-xl">
      <div className="mb-6">
        <h3 className="text-lg font-bold uppercase tracking-tight">Ranking de Produtividade</h3>
        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Análise de desempenho mensal</p>
      </div>
      
      <ResponsiveContainer width="100%" height="80%">
        <BarChart data={data} layout="vertical" margin={{ left: 20, right: 30, top: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#1e293b" strokeOpacity={0.5} />
          <XAxis type="number" hide />
          <YAxis 
            dataKey="name" 
            type="category" 
            tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip 
            cursor={{ fill: 'rgba(255,255,255,0.03)' }}
            contentStyle={{ 
              backgroundColor: '#141b26', 
              borderRadius: '12px', 
              border: '1px solid rgba(255,255,255,0.1)',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar dataKey="score" radius={[0, 4, 4, 0]} barSize={20}>
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} fillOpacity={0.9} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
