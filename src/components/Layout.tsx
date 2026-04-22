import React from 'react';
import { LayoutDashboard, Beaker, FileSpreadsheet, Settings, LogOut, Bell, ShieldCheck, HelpCircle, Zap } from 'lucide-react';

interface LayoutProps {
  children: React.ReactNode;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  user: any;
  onLogout: () => void;
}

export default function Layout({ children, activeTab, setActiveTab, user, onLogout }: LayoutProps) {
  const isAdmin = user?.role === 'ADMIN';

  const menuItems = [
    { id: 'dashboard', label: 'หน้าแรก (Dashboard)', icon: LayoutDashboard },
    { id: 'iqc', label: 'บันทึกค่า QC (IQC)', icon: FileSpreadsheet },
    { id: 'eqa', label: 'ประเมิน EQA', icon: Beaker },
    { id: 'solver', label: 'แก้ปัญหา QC (Solver)', icon: Zap },
    { id: 'guide', label: 'คู่มือแก้ไขปัญหา', icon: HelpCircle },
    ...(isAdmin ? [{ id: 'admin', label: 'จัดการระบบ (Admin)', icon: ShieldCheck }] : []),
    { id: 'settings', label: 'ตั้งค่าระบบ', icon: Settings },
  ];

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900">
      {/* Sidebar */}
      <aside className="w-64 bg-[#0F4C81] text-white flex flex-col">
        <div className="p-6 border-b border-white/10">
          <h1 className="text-xl font-black tracking-tight italic">QC BK Lab Plus<sup>+</sup></h1>
          <p className="text-[10px] text-white/60 mt-1 uppercase tracking-widest font-bold">Lab Quality Control</p>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                activeTab === item.id ? 'bg-white/10 text-white' : 'text-white/70 hover:bg-white/5 hover:text-white'
              }`}
            >
              <item.icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center space-x-3 px-4 py-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center font-bold text-xs">
              {user?.name?.[0] || 'U'}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-semibold truncate">{user?.name || 'User'}</p>
              <p className="text-xs text-white/50 truncate">{user?.licenseNumber || 'MT-12345'}</p>
            </div>
            <button 
              onClick={onLogout}
              className="p-1 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white"
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8">
          <h2 className="text-lg font-semibold text-slate-800">
            {menuItems.find(i => i.id === activeTab)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => setActiveTab('guide')}
              className="p-2 text-slate-400 hover:text-[#0F4C81] transition-colors flex items-center space-x-1"
              title="Troubleshooting Guide"
            >
              <HelpCircle size={18} />
              <span className="text-[10px] font-bold uppercase hidden md:inline">Troubleshoot</span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2 invisible md:visible"></div>
            <button className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors">
              <Bell size={20} />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="h-8 w-px bg-slate-200 mx-2"></div>
            <div className="text-right">
              <p className="text-sm font-medium">{new Date().toLocaleDateString('th-TH', { 
                day: 'numeric', month: 'long', year: 'numeric' 
              })}</p>
            </div>
          </div>
        </header>

        {/* Page Area */}
        <div className="flex-1 overflow-y-auto p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
