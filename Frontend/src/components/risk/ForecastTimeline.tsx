import type { ForecastPoint } from '@/types/risk';
import { RISK_COLORS } from '@/utils/riskColors';
import Panel from '@/components/common/Panel';
import { Clock } from 'lucide-react';

interface ForecastTimelineProps {
  forecast: ForecastPoint[];
}

export default function ForecastTimeline({ forecast }: ForecastTimelineProps) {
  const maxScore = 100;

  return (
    <Panel
      title="Forecast Timeline"
      headerExtra={
        <span className="demo-label">Simulated Forecast</span>
      }
    >
      <div className="space-y-3">
        <div className="flex items-end justify-between gap-1.5 h-36">
          {forecast.map((point, i) => {
            const barHeight = (point.riskScore / maxScore) * 100;
            const isLast = i === forecast.length - 1;
            return (
              <div key={i} className="flex-1 flex flex-col items-center gap-1.5 relative">
                {/* Score + level label above bar */}
                <div className="text-center">
                  <span
                    className="text-sm font-bold tabular-nums"
                    style={{ color: RISK_COLORS[point.riskLevel] }}
                  >
                    {point.riskScore}
                  </span>
                  <p className="text-[8px] font-medium uppercase tracking-wider" style={{ color: RISK_COLORS[point.riskLevel], opacity: 0.7 }}>
                    {point.riskLevel}
                  </p>
                </div>
                {/* Bar */}
                <div className="w-full flex-1 flex items-end relative">
                  <div
                    className={`w-full rounded-t-md transition-all duration-500 animate-slide-up ${isLast ? 'shadow-[0_0_10px_rgba(239,68,68,0.3)]' : ''}`}
                    style={{
                      height: `${barHeight}%`,
                      backgroundColor: RISK_COLORS[point.riskLevel],
                      opacity: 0.8,
                      minHeight: '4px',
                    }}
                  />
                </div>
                {/* Time + rainfall below bar */}
                <div className="text-center">
                  <p className="text-[11px] font-medium text-slate-300">{point.label}</p>
                  <p className="text-[9px] text-slate-500">
                    {point.rainfallExpected > 0 ? `${point.rainfallExpected}mm` : '—'}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 pt-2 border-t border-ink-700">
          <Clock size={12} />
          <span>Trajectory over next 24 hours</span>
        </div>
      </div>
    </Panel>
  );
}
