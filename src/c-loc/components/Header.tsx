import { useEffect } from 'react';
import { Bell } from 'lucide-react';
import { motion } from 'motion/react';
import { UserMenu, type AppProfile } from '../../shared/components/ui/UserMenu';
import type { UserRole } from '../../shared/lib/utils';

const CURRENT_USER = {
  name: 'Daniel Salas',
  role: 'Administrador',
  initials: 'DS',
  isAdmin: true,
};

interface HeaderCLocProps {
  onProfileChange: (p: AppProfile) => void;
  userRole: UserRole;
  onRoleChange: (r: UserRole) => void;
}

export function HeaderCLoc({ onProfileChange, userRole, onRoleChange }: HeaderCLocProps) {
  // Reservado para accesos de teclado globales del perfil C-Loc
  useEffect(() => {}, []);

  return (
    <header className="h-16 bg-white border-b border-neutral-100 flex items-center justify-end px-6 z-30 shrink-0 gap-4">
      <motion.button
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="w-10 h-10 rounded-full flex items-center justify-center relative text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
      >
        <Bell className="w-5 h-5" />
        <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF3B30] rounded-full border-2 border-white" />
      </motion.button>

      <UserMenu
        user={CURRENT_USER}
        profile="c-loc"
        onProfileChange={onProfileChange}
        userRole={userRole}
        onRoleChange={onRoleChange}
      />
    </header>
  );
}
