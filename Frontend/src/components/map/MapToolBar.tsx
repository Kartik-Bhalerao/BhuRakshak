import { Crosshair, Globe, RotateCcw } from 'lucide-react';

interface MapToolBarProps {
  onFocusNER: () => void;
  onResetView: () => void;
  globeMode: boolean;
  onToggleGlobe: () => void;
}

export default function MapToolBar({
  onFocusNER,
  onResetView,
  globeMode,
  onToggleGlobe,
}: MapToolBarProps) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex gap-1.5">
        <button
          onClick={onFocusNER}
          aria-label="Focus on Northeast India region"
          className="flex items-center gap-1.5 bg-ink-900/90 border border-ink-600 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-accent-500/50 hover:text-accent-400 transition-all duration-200"
        >
          <Crosshair size={13} />
          Focus NER
        </button>
        <button
          onClick={onResetView}
          aria-label="Reset map view"
          className="flex items-center gap-1.5 bg-ink-900/90 border border-ink-600 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-accent-500/50 hover:text-accent-400 transition-all duration-200"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>
      <button
        onClick={onToggleGlobe}
        aria-label={globeMode ? 'Exit globe overview' : 'Enter globe overview'}
        className={`flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-medium transition-all duration-200 border ${
          globeMode
            ? 'bg-accent-500/15 border-accent-500/40 text-accent-400'
            : 'bg-ink-900/90 border-ink-600 text-slate-300 hover:border-accent-500/50 hover:text-accent-400'
        }`}
      >
        <Globe size={13} />
        {globeMode ? 'Exit Globe' : 'Globe Overview'}
      </button>
    </div>
  );
}
