import { useEffect, useRef } from 'react';
import { Upload, BarChart3, Users, FileText, RefreshCw, LogOut } from 'lucide-react';
import { useApp } from '../context/AppContext';
import type { Page } from '../types';

const menuItems: { id: Page; icon: typeof Upload; label: string }[] = [
  { id: 'upload', icon: Upload, label: 'Importer' },
  { id: 'dashboard', icon: BarChart3, label: 'Tableau de bord' },
  { id: 'students', icon: Users, label: 'Élèves' },
  { id: 'reports', icon: FileText, label: 'Rapports' },
];

export function Sidebar() {
  const { currentPage, setCurrentPage, students, refresh, clearData } = useApp();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const refreshBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (sidebarRef.current) {
      sidebarRef.current.style.opacity = '0';
      sidebarRef.current.style.transform = 'translateX(-100px)';
      
      requestAnimationFrame(() => {
        if (sidebarRef.current) {
          sidebarRef.current.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
          sidebarRef.current.style.opacity = '1';
          sidebarRef.current.style.transform = 'translateX(0)';
        }
      });

      const menuItems = sidebarRef.current.querySelectorAll('.menu-item');
      menuItems.forEach((item, index) => {
        const el = item as HTMLElement;
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50px)';
        
        setTimeout(() => {
          el.style.transition = 'all 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
          el.style.opacity = '1';
          el.style.transform = 'translateX(0)';
        }, 300 + index * 100);
      });
    }
  }, []);

  const handleRefresh = () => {
    if (refreshBtnRef.current) {
      const svg = refreshBtnRef.current.querySelector('svg');
      if (svg) {
        svg.style.transition = 'transform 0.8s ease';
        svg.style.transform = 'rotate(360deg)';
        setTimeout(() => {
          svg.style.transform = 'rotate(0deg)';
        }, 800);
      }
    }
    refresh();
    
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.transition = 'all 0.3s ease';
      mainContent.style.opacity = '0.5';
      mainContent.style.transform = 'scale(0.98)';
      setTimeout(() => {
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'scale(1)';
      }, 300);
    }
  };

  const handleNavClick = (page: Page) => {
    const mainContent = document.querySelector('.main-content') as HTMLElement;
    if (mainContent) {
      mainContent.style.transition = 'all 0.2s ease';
      mainContent.style.opacity = '0';
      mainContent.style.transform = 'translateX(-20px)';
      
      setTimeout(() => {
        setCurrentPage(page);
        mainContent.style.opacity = '1';
        mainContent.style.transform = 'translateX(0)';
      }, 200);
    } else {
      setCurrentPage(page);
    }
  };

  return (
    <div
      ref={sidebarRef}
      className="fixed left-0 top-0 h-full w-64 glass-panel z-50 flex flex-col"
    >
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center glow-primary">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg">EduAnalytics</h1>
            <p className="text-white/50 text-xs">Pro Edition</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;
          const isDisabled = item.id !== 'upload' && students.length === 0;

          return (
            <button
              key={item.id}
              onClick={() => !isDisabled && handleNavClick(item.id)}
              disabled={isDisabled}
              className={`menu-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 ${
                isActive
                  ? 'bg-gradient-to-r from-indigo-500/30 to-purple-500/30 text-white border border-indigo-500/50 glow-primary'
                  : isDisabled
                  ? 'text-white/30 cursor-not-allowed'
                  : 'text-white/70 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-400' : ''}`} />
              <span className="font-medium">{item.label}</span>
              {isActive && (
                <div className="ml-auto w-2 h-2 rounded-full bg-indigo-400 animate-pulse" />
              )}
            </button>
          );
        })}
      </nav>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 space-y-3">
        {/* Refresh Button */}
        <button
          ref={refreshBtnRef}
          onClick={handleRefresh}
          disabled={students.length === 0}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-semibold transition-all duration-300 btn-glow ${
            students.length > 0
              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:shadow-lg hover:shadow-emerald-500/30'
              : 'bg-white/10 text-white/30 cursor-not-allowed'
          }`}
        >
          <RefreshCw className="w-5 h-5" />
          <span>Actualiser</span>
        </button>

        {/* Clear Data */}
        {students.length > 0 && (
          <button
            onClick={clearData}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-all duration-300"
          >
            <LogOut className="w-5 h-5" />
            <span>Nouvelle session</span>
          </button>
        )}
      </div>

      {/* Stats Footer */}
      {students.length > 0 && (
        <div className="p-4 bg-gradient-to-r from-indigo-500/10 to-purple-500/10">
          <div className="text-center">
            <p className="text-white/50 text-xs mb-1">Données chargées</p>
            <p className="text-white font-bold text-lg">{students.length} élèves</p>
          </div>
        </div>
      )}
    </div>
  );
}
