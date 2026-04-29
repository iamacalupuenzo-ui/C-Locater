/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { FloatingStats } from './components/FloatingStats';
import { FleetMap } from './components/FleetMap';
import { CaminosModule } from './components/CaminosModule';

export default function App() {
  const [activeView, setActiveView] = useState('explore');

  return (
    <div className="flex flex-col w-full h-screen bg-[#F5F5F7] overflow-hidden font-sans">
      <Header />
      <div className="flex flex-1 relative overflow-hidden">
        <Sidebar activeView={activeView} onViewChange={setActiveView} />
        <main className="flex-1 relative w-full h-full min-w-0">
          {activeView === 'explore' && (
            <>
              <FleetMap />
              <FloatingStats />
            </>
          )}
          {activeView === 'caminos' && (
            <CaminosModule />
          )}
        </main>
      </div>
    </div>
  );
}

