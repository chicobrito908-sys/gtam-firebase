"use client";

import React from "react";
import { Calendar, ChevronDown } from "lucide-react";
import Button from "@/components/ui/Button";

interface ScaleHeaderProps {
  date: string;
  setDate: (date: string) => void;
  turno: string;
  setTurno: (turno: string) => void;
  isFetching: boolean;
  availableCount: number;
  onSave: () => void;
  isLoading: boolean;
  turnOptions: { id: string; label: string }[];
}

export default function ScaleHeader({
  date,
  setDate,
  turno,
  setTurno,
  isFetching,
  availableCount,
  onSave,
  isLoading,
  turnOptions
}: ScaleHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
      <div className="flex items-center gap-6">
        <div className="relative group">
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="bg-transparent border-none text-3xl font-black text-white outline-none w-fit cursor-pointer hover:text-[#7c3aed] transition-colors pr-8"
          />
          <Calendar
            className="absolute right-0 top-1/2 -translate-y-1/2 text-[#7c3aed]/40 group-hover:text-[#7c3aed] transition-colors"
            size={20}
          />
        </div>
        
        <div className="h-10 w-px bg-white/10 hidden md:block" />
        
        <div className="flex flex-col">
          <div className="relative">
            <select
              value={turno}
              onChange={(e) => setTurno(e.target.value)}
              className="bg-white/5 border border-white/5 rounded-2xl px-6 py-2 text-sm font-black text-white outline-none appearance-none cursor-pointer hover:bg-white/10 transition-all pr-12"
            >
              {turnOptions.map((t) => (
                <option key={t.id} value={t.id} className="bg-[#1a1f26]">
                  {t.label}
                </option>
              ))}
            </select>
            <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 pointer-events-none" />
          </div>
          
          <div className="flex items-center gap-2 mt-2 px-2">
            <span
              className={`flex h-2 w-2 rounded-full ${
                isFetching ? "bg-amber-500 animate-bounce" : "bg-emerald-500 animate-pulse"
              }`}
            />
            <span
              className={`text-[10px] font-black uppercase tracking-widest ${
                isFetching ? "text-amber-500" : "text-emerald-500/60"
              }`}
            >
              {isFetching ? "Sincronizando..." : `${availableCount} Disponíveis`}
            </span>
          </div>
        </div>
      </div>

      <Button 
        onClick={onSave} 
        isLoading={isLoading} 
        size="lg" 
        className="w-full md:w-auto uppercase tracking-widest font-black"
      >
        Salvar Alterações
      </Button>
    </div>
  );
}
