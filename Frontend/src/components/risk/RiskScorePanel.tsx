import type { RiskZoneProperties, WeatherSnapshot } from '@/types/risk';
import { RISK_COLORS } from '@/utils/riskColors';
import RiskBadge, { RiskScore } from '@/components/common/RiskBadge';
import Panel from '@/components/common/Panel';
import { CloudRain, Droplets, Mountain, TrendingUp, Gauge } from 'lucide-react';

interface RiskScorePanelProps {
  zone: RiskZoneProperties;
  weather: WeatherSnapshot | null;
}

export default function RiskScorePanel({ zone, weather }: RiskScorePanelProps) {
  const metrics = [
    { icon: CloudRain, label: 'Rainfall 24h', value: `${zone.rainfall24h} mm`, color: '#22d3ee' },
    { icon: Droplets, label: 'Soil Moisture', value: `${zone.soilMoisture}%`, color: '#60a5fa' },
    { icon: Mountain, label: 'Terrain Slope', value: `${zone.terrainSlope}°`, color: '#fbbf24' },
    { icon: Gauge, label: 'Confidence', value: `${zone.confidence}%`, color: '#34d399' },
  ];

  return (
    <Panel
      title="Risk Score"
      headerExtra={
        <div className="flex items-center gap-2">
          <RiskBadge level={zone.riskLevel} size="sm" />
          <span className="demo-label">Simulated</span>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <RiskScore score={zone.riskScore} level={zone.riskLevel} />
            <p className="text-xs text-slate-500 mt-1">{zone.name}</p>
            <p className="text-xs text-slate-500">{zone.district}, {zone.state}</p>
          </div>
          <div className="relative w-20 h-20">
            <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
              <circle cx="40" cy="40" r="34" fill="none" stroke="#1b2436" strokeWidth="6" />
              <circle
                cx="40"
                cy="40"
                r="34"
                fill="none"
                stroke={RISK_COLORS[zone.riskLevel]}
                strokeWidth="6"
                strokeDasharray={`${(zone.riskScore / 100) * 213.6} 213.6`}
                strokeLinecap="round"
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-bold text-slate-100 tabular-nums">{zone.riskScore}</span>
              <span className="text-[9px] text-slate-500">SCORE</span>
            </div>
          </div>
        </div>

        {zone.trend !== 0 && (
          <div className="flex items-center gap-1.5 text-xs">
            <TrendingUp size={13} className={zone.trend > 0 ? 'text-sev-high' : 'text-sev-safe'} />
            <span className={zone.trend > 0 ? 'text-sev-high' : 'text-sev-safe'}>
              {zone.trend > 0 ? '+' : ''}{zone.trend} from previous reading
            </span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          {metrics.map((m) => (
            <div key={m.label} className="bg-ink-800/60 rounded-lg p-3">
              <div className="flex items-center gap-2 mb-1">
                <m.icon size={14} style={{ color: m.color }} />
                <span className="text-[10px] text-slate-400 uppercase tracking-wider">{m.label}</span>
              </div>
              <p className="text-sm font-semibold text-slate-200 tabular-nums">{m.value}</p>
            </div>
          ))}
        </div>

        {weather && (
          <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-ink-700">
            <span>{weather.conditions}</span>
            <span>{weather.temperatureC}°C · {weather.humidity}% humidity · {weather.windKph} km/h wind</span>
          </div>
        )}
      </div>
    </Panel>
  );
}
