import { Bell, Activity, Map, Truck } from 'lucide-react';
import { motion } from 'motion/react';

export function Header() {
  return (
    <header className="h-16 bg-white border-b border-gray-200/60 flex items-center justify-between px-6 z-30 shrink-0">
      <div className="flex items-center gap-2.5 w-[240px]">
        <Truck className="w-5 h-5 text-black" strokeWidth={2.5} />
        <span className="text-[20px] font-bold text-gray-900 tracking-tight">CLocation</span>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="flex items-center bg-gray-50/80 p-1 rounded-2xl border border-gray-100 shadow-[inset_0_2px_4px_rgba(0,0,0,0.02)]">
          <motion.button 
            className="px-5 py-2.5 rounded-xl font-semibold text-gray-900 text-[13px] bg-white shadow-[0_2px_8px_rgba(0,0,0,0.04)] flex items-center gap-2 border border-black/[0.04]"
          >
            <Activity className="w-4 h-4 text-gray-700" />
            Panel global
          </motion.button>
          <motion.button 
            className="px-5 py-2.5 rounded-xl font-medium text-gray-500 hover:text-gray-900 text-[13px] transition-colors flex items-center gap-2"
          >
            <Map className="w-4 h-4" />
            Mapa en vivo
          </motion.button>
        </div>
      </div>

      <div className="flex items-center justify-end gap-4 w-[240px]">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-10 h-10 rounded-full flex items-center justify-center relative text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors"
        >
          <Bell className="w-5 h-5" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-[#FF3B30] rounded-full border-2 border-white"></span>
        </motion.button>
        
        <div className="flex items-center gap-2 cursor-pointer group">
          <div className="w-9 h-9 bg-gradient-to-tr from-gray-800 to-gray-600 text-white rounded-full flex items-center justify-center font-medium text-[12px] shadow-sm transform group-hover:scale-105 transition-all">
            DS
          </div>
        </div>
      </div>
    </header>
  );
}
