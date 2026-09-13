interface LayerVisibility {
  zones: boolean;
  villages: boolean;
  roads: boolean;
  infrastructure: boolean;
}

interface LayerControlsProps {
  visibility: LayerVisibility;
  onToggle: (key: keyof LayerVisibility) => void;
}

const LAYER_LABELS: Record<keyof LayerVisibility, string> = {
  zones: 'Risk Zones',
  villages: 'Villages',
  roads: 'Roads',
  infrastructure: 'Infrastructure',
};

export default function LayerControls({ visibility, onToggle }: LayerControlsProps) {
  return (
    <div className="bg-ink-900/95 border border-ink-600 rounded-lg p-3 w-44 animate-slide-up">
      <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Map Layers
      </p>
      <div className="space-y-2">
        {(Object.keys(LAYER_LABELS) as (keyof LayerVisibility)[]).map((key) => (
          <label
            key={key}
            className="flex items-center gap-2 cursor-pointer group"
          >
            <button
                  type="button"
                  onClick={() => onToggle(key)}
                  aria-pressed={visibility[key]}
                  className={`relative flex-shrink-0 w-8 h-4 p-0 rounded-full transition-colors ${
                  visibility[key] ? 'bg-accent-500/40' : 'bg-ink-600'
                      }`}
                  >
              <span
                  className={`absolute left-0.5 top-0.5 w-3 h-3 rounded-full bg-slate-200 transition-transform ${
                  visibility[key] ? 'translate-x-4' : 'translate-x-0'
                 }`}
              />
            </button>
            <span className="text-xs text-slate-300 group-hover:text-slate-100">
              {LAYER_LABELS[key]}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
}
