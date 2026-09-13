import { useEffect, useState } from 'react';
import { Menu, MapPin } from 'lucide-react';

interface HeaderProps {
  title: string;
  onMenuClick: () => void;
}

export default function Header({ title, onMenuClick }: HeaderProps) {
  const [clock, setClock] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="sticky top-0 z-20 bg-ink-950/80 backdrop-blur-md border-b border-ink-700/80">
      <div className="flex items-center justify-between px-4 lg:px-6 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            aria-label="Open menu"
            className="lg:hidden text-slate-400 hover:text-slate-200 transition-colors"
          >
            <Menu size={22} />
          </button>
          <div className="flex items-baseline gap-2">
            <h2 className="text-lg font-semibold text-slate-100">{title}</h2>
            <span className="hidden sm:inline text-[10px] font-medium text-slate-500 uppercase tracking-wider">Command Centre</span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-1.5 text-sm text-slate-400">
            <MapPin size={15} className="text-accent-400" />
            <span>Northeast India</span>
          </div>
          <div className="hidden sm:block w-px h-5 bg-ink-600" />
          <div className="text-sm tabular-nums text-slate-300 font-mono">
            {clock.toLocaleTimeString('en-IN', {
              hour: '2-digit',
              minute: '2-digit',
              second: '2-digit',
              hour12: true,
            })}
          </div>
        </div>
      </div>
    </header>
  );
}
