import { useState } from 'react';
import { HeaderCGo } from './c-go/components/Header';
import { Sidebar } from './c-go/components/Sidebar';
import { HeaderCLoc } from './c-loc/components/Header';
import { SidebarCLoc } from './c-loc/components/Sidebar';
import { FleetMap } from './shared/components/FleetMap';
import { FloatingStats } from './shared/components/FloatingStats';
import { CaminosModule } from './shared/components/CaminosModule';
import type { AppProfile } from './shared/components/ui/UserMenu';
import type { UserRole } from './shared/lib/utils';

export default function App() {
  const [activeView, setActiveView] = useState('explore');
  const [profile, setProfile] = useState<AppProfile>('c-go');
  const [userRole, setUserRole] = useState<UserRole>('admin');

  if (profile === 'c-loc') {
    return (
      <div className="flex w-full h-screen bg-[#F5F5F7] overflow-hidden font-sans">
        <SidebarCLoc activeView={activeView} onViewChange={setActiveView} />
        <div className="flex flex-col flex-1 overflow-hidden">
          <HeaderCLoc onProfileChange={setProfile} userRole={userRole} onRoleChange={setUserRole} />
          <main className="flex-1 relative w-full min-w-0 overflow-hidden">
            {activeView === 'explore' && (
              <>
                <FleetMap />
                <FloatingStats profile={profile} userRole={userRole} />
              </>
            )}
            {activeView === 'caminos' && <CaminosModule />}
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-screen bg-[#F5F5F7] overflow-hidden font-sans">
      <HeaderCGo onProfileChange={setProfile} userRole={userRole} onRoleChange={setUserRole} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 relative w-full min-w-0 overflow-hidden">
          {activeView === 'explore' && (
            <>
              <FleetMap />
              <FloatingStats profile={profile} userRole={userRole} />
            </>
          )}
          {activeView === 'caminos' && <CaminosModule />}
        </main>
      </div>
    </div>
  );
}
