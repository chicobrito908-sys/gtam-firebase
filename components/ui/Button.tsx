"use client";

import React from "react";
import { motion } from "framer-motion";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger" | "success";
  size?: "sm" | "md" | "lg";
  isLoading?: boolean;
}

export default function Button({
  children,
  variant = "primary",
  size = "md",
  isLoading,
  className = "",
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = "relative inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-[#0b1016] disabled:opacity-50 disabled:cursor-not-allowed";
  


  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-5 py-2.5 text-sm",
    lg: "px-8 py-3.5 text-base"
  };

  // Convert variant classes to tailwind-safe strings
  const getVariantClass = () => {
    switch(variant) {
      case "primary": return "bg-[#7c3aed] text-white hover:bg-[#8b5cf6] focus:ring-[#7c3aed]";
      case "secondary": return "bg-[#1f2937] text-white hover:bg-[#374151] focus:ring-[#4b5563]";
      case "ghost": return "bg-transparent text-[#94a3b8] hover:bg-white/5 border border-[#30363d]";
      case "danger": return "bg-[#ef4444] text-white hover:bg-[#dc2626] focus:ring-[#ef4444]";
      case "success": return "bg-[#10b981] text-white hover:bg-[#059669] focus:ring-[#10b981]";
      default: return "";
    }
  };

  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.02 }}
      whileTap={{ scale: disabled ? 1 : 0.98 }}
      className={`${baseStyles} ${getVariantClass()} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <svg className="animate-spin h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Carregando...
        </span>
      ) : (
        children
      )}
    </motion.button>
  );
}
