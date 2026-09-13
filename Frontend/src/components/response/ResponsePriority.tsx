import type { ResponsePriorityItem } from '@/types/risk';
import Panel from '@/components/common/Panel';
import RiskBadge from '@/components/common/RiskBadge';
import { formatNumber } from '@/utils/formatters';
import { RISK_COLORS } from '@/utils/riskColors';
import { AlertCircle, ArrowRight } from 'lucide-react';

interface ResponsePriorityProps {
  items: ResponsePriorityItem[];
  selectedZoneId: string | null;
  onSelectZone: (zoneId: string) => void;
}

const priorityColors: Record<string, string> = {
  P1: '#ef4444',
  P2: '#f97316',
  P3: '#facc15',
};

const connectivityColors: Record<string, string> = {
  stable: '#22c55e',
  degraded: '#f97316',
  critical: '#ef4444',
};

export default function ResponsePriority({
  items,
  selectedZoneId,
  onSelectZone,
}: ResponsePriorityProps) {
  return (
    <Panel
      title="Response Priority Queue"
      headerExtra={<span className="demo-label">Simulated</span>}
      noPadding
    >
      <div className="max-h-[420px] overflow-y-auto divide-y divide-ink-700">
        {items.map((item) => {
          const isSelected = item.zoneId === selectedZoneId;
          return (
            <button
              key={item.zoneId}
              onClick={() => onSelectZone(item.zoneId)}
              className={`w-full text-left px-4 py-3 transition-colors ${
                isSelected
                  ? 'bg-accent-500/10 border-l-2 border-accent-400'
                  : 'hover:bg-ink-800/60 border-l-2 border-transparent'
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded"
                    style={{
                      color: priorityColors[item.priority],
                      backgroundColor: `${priorityColors[item.priority]}15`,
                    }}
                  >
                    {item.priority}
                  </span>
                  <span className="text-sm font-medium text-slate-200">{item.zoneName}</span>
                </div>
                <RiskBadge level={item.riskLevel} size="sm" />
              </div>

              <div className="flex items-center gap-4 text-xs text-slate-400 mb-2">
                <span className="tabular-nums">
                  Score: <span style={{ color: RISK_COLORS[item.riskLevel] }}>{item.riskScore}</span>
                </span>
                <span className="tabular-nums">
                  Pop: <span className="text-slate-300">{formatNumber(item.populationExposed)}</span>
                </span>
                <span>
                  Link:{' '}
                  <span style={{ color: connectivityColors[item.connectivity] }}>
                    {item.connectivity}
                  </span>
                </span>
                <span className="tabular-nums text-slate-500">Conf: {item.confidence}%</span>
              </div>

              <div className="flex items-start gap-1.5 text-xs text-slate-400">
                <AlertCircle size={13} className="mt-0.5 flex-shrink-0 text-amber-400/60" />
                <span>{item.recommendedAction}</span>
              </div>

              <div className="flex items-center justify-between mt-2 pt-2 border-t border-ink-700/50">
                <span className="text-[11px] text-slate-500">
                  ETA: <span className="text-slate-300">{item.estimatedResponseTime}</span>
                </span>
                <span className="text-[11px] text-accent-400 flex items-center gap-1">
                  Details <ArrowRight size={11} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </Panel>
  );
}
