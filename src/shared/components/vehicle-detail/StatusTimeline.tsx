import { Check } from 'lucide-react';
import { cn } from '../../lib/utils';

export type TimelineStage = {
  id: string;
  label: string;
  timestamp?: string;
  state: 'done' | 'active' | 'pending';
};

interface StatusTimelineProps {
  stages: TimelineStage[];
  isDark?: boolean;
}

export function StatusTimeline({ stages, isDark = false }: StatusTimelineProps) {
  return (
    <div className={cn(
      'px-4 py-3 border-b shrink-0',
      isDark ? 'border-zinc-800' : 'border-neutral-100',
    )}>
      <div className="flex items-start gap-0">
        {stages.map((stage, i) => {
          const isLast = i === stages.length - 1;
          return (
            <div key={stage.id} className="flex flex-col items-center flex-1 min-w-0">
              {/* Node + connector */}
              <div className="flex items-center w-full">
                {/* Left connector */}
                <div className={cn(
                  'flex-1 h-[2px]',
                  i === 0 ? 'invisible' :
                  stage.state === 'pending' ? (isDark ? 'bg-zinc-700' : 'bg-neutral-200') :
                  (isDark ? 'bg-emerald-600' : 'bg-emerald-500'),
                )} />
                {/* Node */}
                <div className={cn(
                  'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
                  stage.state === 'done'
                    ? (isDark ? 'bg-emerald-600 border-emerald-600' : 'bg-emerald-500 border-emerald-500')
                    : stage.state === 'active'
                      ? (isDark ? 'bg-zinc-900 border-emerald-500' : 'bg-white border-emerald-500')
                      : (isDark ? 'bg-zinc-900 border-zinc-700' : 'bg-white border-neutral-200'),
                )}>
                  {stage.state === 'done' && <Check className="w-2.5 h-2.5 text-white" strokeWidth={3} />}
                  {stage.state === 'active' && <span className="w-2 h-2 rounded-full bg-emerald-500" />}
                </div>
                {/* Right connector */}
                <div className={cn(
                  'flex-1 h-[2px]',
                  isLast ? 'invisible' :
                  stages[i + 1]?.state === 'pending' ? (isDark ? 'bg-zinc-700' : 'bg-neutral-200') :
                  (isDark ? 'bg-emerald-600' : 'bg-emerald-500'),
                )} />
              </div>
              {/* Label */}
              <div className="flex flex-col items-center mt-1.5 px-1 w-full">
                <span className={cn(
                  'text-[9.5px] font-semibold text-center leading-tight truncate w-full text-center',
                  stage.state === 'pending'
                    ? (isDark ? 'text-zinc-600' : 'text-neutral-300')
                    : (isDark ? 'text-zinc-300' : 'text-slate-700'),
                )}>
                  {stage.label}
                </span>
                {stage.timestamp && (
                  <span className={cn(
                    'text-[8.5px] text-center leading-tight mt-0.5',
                    isDark ? 'text-zinc-600' : 'text-slate-400',
                  )}>
                    {stage.timestamp}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
