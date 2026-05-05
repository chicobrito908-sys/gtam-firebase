"use client";
import React from "react";

interface SectionCardProps {
  title: string;
  subtitle?: string;
  icon?: React.ElementType;
  iconColor?: string;
  panelTint?: string;
  actions?: React.ReactNode;
  children: React.ReactNode;
}

export default function SectionCard({
  title, subtitle, icon: Icon, iconColor = "text-primary",
  panelTint = "bg-primary/10", actions, children,
}: SectionCardProps) {
  return (
    <div className="bg-card border border-white/5 rounded-2xl overflow-hidden shadow-xl shadow-black/20">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
        <div className="flex items-center gap-3">
          {Icon && (
            <div className={`p-2 ${panelTint} rounded-xl`}>
              <Icon size={18} className={iconColor} />
            </div>
          )}
          <div>
            <p className="text-sm font-black uppercase tracking-widest">{title}</p>
            {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
          </div>
        </div>
        {actions && <div>{actions}</div>}
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}
