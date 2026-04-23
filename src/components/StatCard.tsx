'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  progress?: number;
  trend?: {
    value: string;
    positive: boolean;
  };
}

export default function StatCard({ label, value, icon: Icon, color, progress, trend }: StatCardProps) {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="card flex flex-col gap-4"
    >
      <div className="flex items-start justify-between">
        <div 
          className="w-12 h-12 rounded-2xl flex items-center justify-center"
          style={{ background: `${color}15`, color: color }}
        >
          <Icon size={24} />
        </div>
        {trend && (
          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${trend.positive ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
            {trend.positive ? '+' : ''}{trend.value}
          </span>
        )}
      </div>

      <div>
        <p className="text-[11px] font-bold text-muted uppercase tracking-wider">{label}</p>
        <h3 className="text-2xl font-black text-dark mt-1">{value}</h3>
      </div>

      {progress !== undefined && (
        <div className="w-full h-1.5 bg-background rounded-full overflow-hidden mt-2">
          <motion.div 
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            className="h-full rounded-full"
            style={{ backgroundColor: color }}
          />
        </div>
      )}
    </motion.div>
  );
}
