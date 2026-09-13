import type { ExposureSummary } from '@/types/risk';
import Panel from '@/components/common/Panel';
import { formatNumber } from '@/utils/formatters';
import { Home, Users, Route, Construction, Hospital, School, Wifi } from 'lucide-react';

interface ExposurePanelProps {
  exposure: ExposureSummary | null;
}

const connectivityColors: Record<string, string> = {
  stable: '#22c55e',
  degraded: '#f97316',
  critical: '#ef4444',
};

export default function ExposurePanel({ exposure }: ExposurePanelProps) {
  if (!exposure) {
    return (
      <Panel title="Exposure & Impact">
        <p className="text-sm text-slate-500 py-4">Select a zone to view exposure data.</p>
      </Panel>
    );
  }

  const items = [
    { icon: Home, label: 'Villages Affected', value: exposure.villagesAffected, color: '#fbbf24' },
    { icon: Users, label: 'Population Exposed', value: formatNumber(exposure.populationExposed), color: '#f87171' },
    { icon: Route, label: 'Roads Affected', value: exposure.roadsAffected, color: '#60a5fa' },
    { icon: Construction, label: 'Bridges at Risk', value: exposure.bridgesAffected, color: '#fbbf24' },
    { icon: Hospital, label: 'Hospitals', value: exposure.hospitals, color: '#f87171' },
    { icon: School, label: 'Schools', value: exposure.schools, color: '#60a5fa' },
  ];

  return (
    <Panel
      title="Exposure & Impact"
      headerExtra={<span className="demo-label">Simulated</span>}
    >
      <div className="grid grid-cols-3 gap-3 mb-4">
        {items.map((item) => (
          <div key={item.label} className="bg-ink-800/60 rounded-lg p-3 text-center">
            <item.icon size={18} className="mx-auto mb-1.5" style={{ color: item.color }} />
            <p className="text-lg font-bold text-slate-100 tabular-nums">{item.value}</p>
            <p className="text-[9px] text-slate-400 uppercase tracking-wider mt-0.5">{item.label}</p>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-ink-700">
        <div className="flex items-center gap-2">
          <Wifi size={14} style={{ color: connectivityColors[exposure.connectivityStatus] }} />
          <span className="text-xs text-slate-400">Connectivity</span>
        </div>
        <span
          className="text-xs font-semibold uppercase tracking-wider"
          style={{ color: connectivityColors[exposure.connectivityStatus] }}
        >
          {exposure.connectivityStatus}
        </span>
      </div>
    </Panel>
  );
}
