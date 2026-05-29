import React from 'react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { useTheme } from '../../lib/ThemeContext';

interface StatCardProps {
  icon: React.ElementType;
  value: string;
  label: string;
  iconColor: string;
  iconBg: string;
  delay?: number;
  compact?: boolean;
  onClick?: () => void;
  active?: boolean;
}

export function StatCard({ icon: Icon, value, label, iconColor, iconBg, delay = 0, compact = false, onClick, active = false }: StatCardProps) {
  const { isDark } = useTheme();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: [0.23, 1, 0.32, 1] }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className={cn(
        'backdrop-blur-2xl flex items-center shadow-[0_2px_10px_rgba(0,0,0,0.1)] flex-1 transition-shadow border',
        onClick ? 'pointer-events-auto cursor-pointer' : 'pointer-events-auto cursor-default',
        active
          ? (isDark ? 'bg-zinc-800/95 border-zinc-600' : 'bg-white border-purple-300/70 shadow-[0_2px_10px_rgba(168,85,247,0.15)]')
          : (isDark ? 'bg-zinc-900/85 border-zinc-700/60' : 'bg-white/85 border-white/70'),
        compact
          ? 'rounded-lg p-2 pr-3 gap-2 min-w-[110px]'
          : 'rounded-xl p-3 pr-4 gap-2.5 min-w-[130px]'
      )}
    >
      <div className={cn('flex items-center justify-center shrink-0', compact ? 'w-7 h-7 rounded-md' : 'w-8 h-8 rounded-lg', iconBg)}>
        <Icon className={cn(compact ? 'w-3.5 h-3.5' : 'w-4 h-4', iconColor)} strokeWidth={1.75} />
      </div>
      <div className="flex flex-col gap-0.5">
        <div className={cn('font-semibold tracking-tight leading-none', compact ? 'text-[12px]' : 'text-[12px]', isDark ? 'text-zinc-100' : 'text-slate-900')}>{value}</div>
        <div className={cn('font-medium leading-none', compact ? 'text-[9.5px]' : 'text-[10px]', isDark ? 'text-zinc-500' : 'text-slate-500')}>{label}</div>
      </div>
    </motion.div>
  );
}
