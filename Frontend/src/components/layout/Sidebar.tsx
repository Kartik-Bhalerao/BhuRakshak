import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Map,
  Bell,
  FileText,
  BarChart3,
  CloudRain,
  Settings,
  Shield,
  X,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/risk-map', label: 'Risk Map', icon: Map },
  { to: '/alerts', label: 'Alerts', icon: Bell },
  { to: '/reports', label: 'Reports', icon: FileText },
  { to: '/analytics', label: 'Analytics', icon: BarChart3 },
  { to: '/simulation', label: 'Simulation', icon: CloudRain },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 lg:hidden"
          onClick={onClose}
          role="button"
          tabIndex={0}
          aria-label="Close menu"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === 'Escape') onClose();
          }}
        />
      )}
      <aside
        className={`fixed lg:sticky top-0 left-0 h-screen w-60 bg-ink-900/95 backdrop-blur-sm border-r border-ink-700 z-40 flex flex-col transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="flex items-center justify-between px-5 py-5 border-b border-ink-700">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center shadow-[0_0_12px_rgba(34,211,238,0.15)]">
              <Shield size={20} className="text-accent-400" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-slate-100 tracking-wide">BhuRakshak</h1>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">Command Centre</p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close menu"
            className="lg:hidden text-slate-400 hover:text-slate-200"
          >
            <X size={18} />
          </button>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-accent-500/10 text-accent-400 border border-accent-500/20 shadow-[0_0_10px_rgba(34,211,238,0.08)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-ink-800/60 border border-transparent'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="px-4 py-3 border-t border-ink-700">
          <div className="flex items-center gap-2 text-[10px] text-amber-400/70">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse-slow" />
            SIMULATED DEMO DATA
          </div>
        </div>
      </aside>
    </>
  );
}
