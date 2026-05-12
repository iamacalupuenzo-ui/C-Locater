import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColor: string;
  iconBg: string;
  delay?: number;
}

export function StatCard({ icon: Icon, value, label, iconColor, iconBg, delay = 0 }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
      className="bg-white/85 backdrop-blur-2xl rounded-xl p-3 pr-4 flex items-center gap-2.5 shadow-[0_2px_10px_rgba(0,0,0,0.05)] border border-white/70 flex-1 min-w-[130px] pointer-events-auto cursor-default transition-shadow"
    >
      <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', iconBg)}>
        <Icon className={cn('w-4 h-4', iconColor)} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className="text-[12px] font-semibold text-slate-900 tracking-tight leading-none">{value}</div>
        <div className="text-[10px] font-medium text-slate-500 leading-none">{label}</div>
      </div>
    </motion.div>
  );
}
