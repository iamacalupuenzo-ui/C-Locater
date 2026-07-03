import { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'motion/react';
import { Bell, BellOff, ChevronDown, X } from 'lucide-react';
import { cn } from '../lib/utils';
import type { Alert, AlertStatus } from '../lib/alertData';
import { AlertPopup } from './alerts/AlertPopup';
import { AlertCard } from './alerts/AlertCard';

interface AlertOverlayProps {
  alerts: Alert[];
  onUpdateStatus: (id: string, status: AlertStatus) => void;
  isDark?: boolean;
  showBell?: boolean;
}

export function AlertOverlay({ alerts, onUpdateStatus, isDark = false, showBell = true }: AlertOverlayProps) {
  const [isOpen, setIsOpen]         = useState(false);
  const [popupQueue, setPopupQueue] = useState<Alert[]>([]);
  const shownRef = useRef<Set<string>>(new Set());
  const panelRef  = useRef<HTMLDivElement>(null);
  const listRef   = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState(false);

  const checkScroll = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    setShowScrollHint(el.scrollHeight > el.clientHeight + 4 && el.scrollTop + el.clientHeight < el.scrollHeight - 10);
  }, []);

  useEffect(() => {
    alerts.forEach(a => shownRef.current.add(a.id));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const newOnes = alerts.filter(a => !shownRef.current.has(a.id));
    if (newOnes.length === 0) return;
    newOnes.forEach(a => shownRef.current.add(a.id));
    setPopupQueue(prev => [...newOnes, ...prev].slice(0, 3));
  }, [alerts]);


  useEffect(() => { if (isOpen) setTimeout(checkScroll, 200); }, [isOpen, checkScroll]);
  useEffect(() => { setTimeout(checkScroll, 80); }, [alerts, checkScroll]);

  // Close on Escape
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setIsOpen(false); };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen]);

  const dismissPopup = useCallback((id: string) => {
    setPopupQueue(prev => prev.filter(a => a.id !== id));
  }, []);

  const handleReview = useCallback((id: string) => {
    onUpdateStatus(id, 'attending');
    setIsOpen(true);
  }, [onUpdateStatus]);

  const sorted = [...alerts].sort((a, b) => {
    const sevOrder = { critical: 0, warning: 1, info: 2 };
    if (sevOrder[a.severity] !== sevOrder[b.severity]) return sevOrder[a.severity] - sevOrder[b.severity];
    return b.timestamp.getTime() - a.timestamp.getTime();
  });
  const active   = sorted.filter(a => a.status !== 'finished');
  const finished = sorted.filter(a => a.status === 'finished');
  const activeCount = alerts.filter(a => a.status === 'active').length;

  return createPortal(
    <>
      {/* Bell + expandable card anchored top-right */}
      {showBell && (
        <div className="fixed top-4 right-4 z-[800] flex flex-col items-end">
          <AnimatePresence mode="wait" initial={false}>
            {!isOpen ? (
              /* ── Pill colapsada ── */
              <motion.button
                key="pill"
                onClick={() => setIsOpen(true)}
                initial={{ opacity: 0, y: -6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.96 }}
                transition={{ duration: 0.16 }}
                className={cn(
                  'relative flex items-center justify-center w-9 h-9 rounded-xl backdrop-blur-xl border shadow-[0_4px_20px_rgba(0,0,0,0.11)] transition-colors',
                  isDark
                    ? 'bg-zinc-900/90 border-zinc-700 text-zinc-300 hover:text-zinc-100'
                    : 'bg-white/90 border-white/70 text-slate-600 hover:text-brand hover:border-brand/30',
                )}
              >
                <Bell className="w-4 h-4" strokeWidth={1.75} />
                {activeCount > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[16px] h-4 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-[9px] font-bold leading-none">
                    {activeCount > 9 ? '9+' : activeCount}
                  </span>
                )}
              </motion.button>
            ) : (
              /* ── Panel expandido ── */
              <motion.div
                key="panel"
                ref={panelRef}
                initial={{ opacity: 0, y: -10, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className={cn(
                  'w-[320px] max-h-[520px] flex flex-col rounded-xl overflow-hidden',
                  'shadow-[0_8px_32px_rgba(0,0,0,0.13)] border backdrop-blur-2xl',
                  isDark
                    ? 'bg-zinc-900/96 border-zinc-800'
                    : 'bg-white/94 border-white/70',
                )}
              >
                {/* Header */}
                <div className={cn(
                  'flex items-center justify-between px-4 py-3 border-b shrink-0',
                  isDark ? 'border-zinc-800' : 'border-neutral-100',
                )}>
                  <div className="flex items-center gap-2">
                    <Bell className={cn('w-3.5 h-3.5', isDark ? 'text-zinc-400' : 'text-slate-400')} strokeWidth={1.75} />
                    <span className={cn('text-[13px] font-semibold', isDark ? 'text-zinc-100' : 'text-slate-900')}>
                      Alertas
                    </span>
                    {activeCount > 0 && (
                      <span className="min-w-[20px] h-5 px-1.5 flex items-center justify-center rounded-full bg-red-500 text-white text-[10px] font-bold">
                        {activeCount}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setIsOpen(false)}
                    className={cn(
                      'w-7 h-7 flex items-center justify-center rounded-lg transition-colors',
                      isDark ? 'text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200' : 'text-slate-400 hover:bg-neutral-100 hover:text-slate-600',
                    )}
                  >
                    <X className="w-4 h-4" strokeWidth={2} />
                  </button>
                </div>

                {/* Body con scroll */}
                <div
                  ref={listRef}
                  onScroll={checkScroll}
                  className="flex-1 overflow-y-auto [&::-webkit-scrollbar]:hidden"
                  style={{ scrollbarWidth: 'none' }}
                >
                  {active.length === 0 && finished.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-32 gap-3 px-6 text-center">
                      <div className={cn('w-10 h-10 rounded-full flex items-center justify-center', isDark ? 'bg-zinc-800' : 'bg-slate-100')}>
                        <BellOff className={cn('w-4 h-4', isDark ? 'text-zinc-500' : 'text-slate-400')} />
                      </div>
                      <p className={cn('text-[12px] font-medium', isDark ? 'text-zinc-400' : 'text-slate-500')}>
                        Sin alertas activas
                      </p>
                    </div>
                  ) : (
                    <div className="p-3 flex flex-col gap-2">
                      {active.map(alert => (
                        <AlertCard
                          key={alert.id}
                          alert={alert}
                          onReview={(id) => onUpdateStatus(id, 'attending')}
                        />
                      ))}
                      {finished.length > 0 && (
                        <>
                          <p className={cn('text-[10px] font-semibold uppercase tracking-wider px-1 mt-1', isDark ? 'text-zinc-500' : 'text-slate-400')}>
                            Finalizadas
                          </p>
                          {finished.slice(0, 5).map(alert => (
                            <div key={alert.id} className="opacity-50">
                              <AlertCard alert={alert} onReview={() => {}} />
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>

                {/* Scroll hint */}
                <AnimatePresence>
                  {showScrollHint && (
                    <motion.div
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="sticky bottom-0 left-0 right-0 flex flex-col items-center pointer-events-none"
                    >
                      <div className={cn('w-full h-5 bg-gradient-to-t to-transparent', isDark ? 'from-zinc-900/90 via-zinc-900/60' : 'from-white/90 via-white/60')} />
                      <div className={cn('w-full flex justify-center pb-2', isDark ? 'bg-zinc-900/90' : 'bg-white/90')}>
                        <motion.div animate={{ y: [0, 5, 0] }} transition={{ duration: 0.9, repeat: Infinity, ease: 'easeInOut' }}>
                          <ChevronDown className={cn('w-4 h-4', isDark ? 'text-zinc-500' : 'text-neutral-400')} strokeWidth={2.5} />
                        </motion.div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Popup stack — bottom-right */}
      <div className="fixed bottom-6 right-4 z-[950] flex flex-col-reverse gap-2 pointer-events-none">
        <AnimatePresence>
          {popupQueue.map(alert => (
            <div key={alert.id} className="pointer-events-auto">
              <AlertPopup
                alert={alert}
                onDismiss={dismissPopup}
                onReview={handleReview}
              />
            </div>
          ))}
        </AnimatePresence>
      </div>
    </>,
    document.body,
  );
}
