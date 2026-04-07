"use client";

import React from "react";
import { motion } from "framer-motion";

interface CardProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  className?: string;
  headerAction?: React.ReactNode;
  noPadding?: boolean;
}

export default function Card({ 
  children, 
  title, 
  subtitle, 
  className = "", 
  headerAction,
  noPadding = false 
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden shadow-xl ${className}`}
    >
      {(title || headerAction) && (
        <div className="px-6 py-4 border-b border-[#30363d] flex items-center justify-between">
          <div>
            {title && <h3 className="text-lg font-semibold text-gray-100">{title}</h3>}
            {subtitle && <p className="text-sm text-gray-400">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className={noPadding ? "" : "p-6"}>
        {children}
      </div>
    </motion.div>
  );
}
