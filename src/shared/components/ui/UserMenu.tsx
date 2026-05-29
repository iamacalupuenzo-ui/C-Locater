import { useEffect, useRef, useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { ChevronDown, ChevronRight, Settings, LogOut, UserCircle2, Check, Monitor, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '../../lib/utils';
import type { UserRole } from '../../lib/utils';

export type AppProfile = 'c-go' | 'c-loc';

export interface UserMenuUser {
  name: string;
  role: string;
  initials: string;
  isAdmin?: boolean;
}

interface UserMenuProps {
  user: UserMenuUser;
  profile: AppProfile;
  onProfileChange: (p: AppProfile) => void;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
  onSettings?: () => void;
  onLogout?: () => void;
}

const PROFILES: { id: AppProfile; label: string }[] = [
  { id: 'c-go',  label: 'C-Go'  },
  { id: 'c-loc', label: 'C-Loc' },
];

const ROLES: { id: UserRole; label: string }[] = [
  { id: 'admin',     label: 'Administrador'    },
  { id: 'esad',      label: 'ESAD'             },
  { id: 'operator',  label: 'Concesionaria'    },
  { id: 'client',    label: 'Cliente Directo'  },
  { id: 'developer', label: 'Desarrollador'    },
];

export function UserMenu({ user, profile, onProfileChange, userRole, onRoleChange, onSettings, onLogout }: UserMenuProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);
  const [profileExpanded, setProfileExpanded] = useState(false);
  const [roleExpanded, setRoleExpanded] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const isOpen = pos !== null;

  const open = useCallback(() => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    setPos({ top: rect.bottom + 6, left: rect.right - 208 });
  }, []);

  const close = useCallback(() => {
    setPos(null);
    setProfileExpanded(false);
    setRoleExpanded(false);
  }, []);

  const toggle = useCallback(() => (isOpen ? close() : open()), [isOpen, close, open]);

  useEffect(() => {
    const el = triggerRef.current;
    if (!el) return;
    const stop = (e: MouseEvent) => e.stopPropagation();
    el.addEventListener('mousedown', stop);
    return () => el.removeEventListener('mousedown', stop);
  }, []);

  useEffect(() => {
    if (!pos) return;
    const handler = (e: MouseEvent) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      close();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [pos, close]);

  const currentProfileLabel = PROFILES.find(p => p.id === profile)?.label ?? '';
  const currentRoleLabel    = ROLES.find(r => r.id === userRole)?.label ?? '';

  return (
    <>
      {/* Trigger */}
      <motion.button
        ref={triggerRef}
        onClick={toggle}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="flex items-center gap-2.5 pl-1 pr-2 py-1 rounded-full hover:bg-gray-50 transition-colors"
      >
        <div className="w-9 h-9 bg-gradient-to-tr from-gray-800 to-gray-600 text-white rounded-full flex items-center justify-center font-semibold text-[12px] shadow-sm shrink-0">
          {user.initials}
        </div>
        <div className="flex flex-col items-start gap-[3px]">
          <span className="text-[13px] font-semibold text-gray-900 leading-none">{user.name}</span>
          <span className="text-[11px] font-medium text-gray-400 leading-none tracking-wide">{currentRoleLabel}</span>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2, ease: 'easeInOut' }}
        >
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </motion.div>
      </motion.button>

      {/* Dropdown panel */}
      {isOpen && createPortal(
        <div
          ref={panelRef}
          onMouseDown={e => e.stopPropagation()}
          style={{ top: pos!.top, left: pos!.left, width: 208 }}
          className="fixed z-[9999] bg-white border border-gray-100 rounded-xl shadow-[0_4px_16px_rgba(0,0,0,0.08)] py-1 overflow-hidden"
        >
          {/* Sección switching — solo para admins */}
          {user.isAdmin && (
            <>
              <div className="px-3.5 pt-2 pb-1">
                <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest">Cuenta</span>
              </div>

              {/* Switcher de Plataforma */}
              <button
                onClick={() => { setProfileExpanded(v => !v); setRoleExpanded(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <Monitor className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="flex-1 text-left truncate">
                  Plataforma
                  <span className="ml-1.5 text-[11px] text-gray-400 font-normal">{currentProfileLabel}</span>
                </span>
                <motion.div animate={{ rotate: profileExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {profileExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden bg-gray-50"
                  >
                    {PROFILES.map(p => (
                      <button
                        key={p.id}
                        onClick={() => { onProfileChange(p.id); close(); }}
                        className="w-full flex items-center gap-2.5 px-5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <Check className={cn('w-3 h-3 shrink-0', profile === p.id ? 'text-gray-900' : 'text-transparent')} />
                        {p.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Switcher de Rol */}
              <button
                onClick={() => { setRoleExpanded(v => !v); setProfileExpanded(false); }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                <span className="flex-1 text-left truncate">
                  Rol
                  <span className="ml-1.5 text-[11px] text-gray-400 font-normal">{currentRoleLabel}</span>
                </span>
                <motion.div animate={{ rotate: roleExpanded ? 90 : 0 }} transition={{ duration: 0.15 }}>
                  <ChevronRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                </motion.div>
              </button>

              <AnimatePresence initial={false}>
                {roleExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="overflow-hidden bg-gray-50"
                  >
                    {ROLES.map(r => (
                      <button
                        key={r.id}
                        onClick={() => { onRoleChange(r.id); close(); }}
                        className="w-full flex items-center gap-2.5 px-5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                      >
                        <Check className={cn('w-3 h-3 shrink-0', userRole === r.id ? 'text-gray-900' : 'text-transparent')} />
                        {r.label}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="h-px bg-gray-100 my-1 mx-3" />
            </>
          )}

          {/* Configuración */}
          <button
            onClick={() => { onSettings?.(); close(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
          >
            <Settings className="w-3.5 h-3.5 text-gray-400 shrink-0" />
            Configuración
          </button>

          {/* Cerrar sesión */}
          <div className="h-px bg-gray-100 my-1 mx-3" />
          <button
            onClick={() => { onLogout?.(); close(); }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-[13px] font-medium text-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5 text-red-400 shrink-0" />
            Cerrar sesión
          </button>
        </div>,
        document.body
      )}
    </>
  );
}
