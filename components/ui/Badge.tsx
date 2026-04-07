"use client";

import React from "react";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "primary" | "secondary" | "success" | "danger" | "warning" | "info" | "outline";
  className?: string;
  size?: "sm" | "md";
}

export default function Badge({ 
  children, 
  variant = "primary", 
  className = "", 
  size = "sm" 
}: BadgeProps) {
  const baseStyles = "inline-flex items-center font-semibold rounded-full";
  
  const sizes = {
    sm: "px-2 py-0.5 text-[10px]",
    md: "px-2.5 py-1 text-xs"
  };

  const variants = {
    primary: "bg-[#7c3aed]/10 text-[#7c3aed] border border-[#7c3aed]/20",
    secondary: "bg-gray-100/10 text-gray-400 border border-gray-100/20",
    success: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    danger: "bg-red-500/10 text-red-400 border border-red-500/20",
    warning: "bg-amber-500/10 text-amber-400 border border-amber-500/20",
    info: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    outline: "bg-transparent text-gray-400 border border-white/10"
  };

  return (
    <span className={`${baseStyles} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
}
