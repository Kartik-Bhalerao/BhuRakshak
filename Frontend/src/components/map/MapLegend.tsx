import { RISK_COLORS, RISK_LEVELS } from '@/utils/riskColors';

export default function MapLegend() {
  return (
    <div className="absolute bottom-3 left-3 z-10 bg-ink-900/90 border border-ink-700 rounded-lg px-3 py-2.5">
      <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
        Risk Level
      </p>
      <div className="space-y-1.5">
        {RISK_LEVELS.map((level) => (
          <div key={level} className="flex items-center gap-2">
            <span
              className="inline-block w-3 h-3 rounded-sm"
              style={{ backgroundColor: RISK_COLORS[level] }}
            />
            <span className="text-xs text-slate-300">{level}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
