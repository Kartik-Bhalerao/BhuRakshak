import type { AlertItem } from '@/types/risk';
import { RISK_COLORS } from '@/utils/riskColors';
import RiskBadge from '@/components/common/RiskBadge';
import { timeAgo } from '@/utils/formatters';
import { AlertTriangle, CheckCircle2, MapPin } from 'lucide-react';

interface AlertCardProps {
  alert: AlertItem;
  onAcknowledge?: (alertId: string) => void;
}

export default function AlertCard({ alert, onAcknowledge }: AlertCardProps) {
  return (
    <div
      className="panel p-4 transition-colors hover:border-ink-600 animate-fade-in"
      style={{ borderLeftColor: RISK_COLORS[alert.level], borderLeftWidth: '3px' }}
    >
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-2.5">
          <AlertTriangle size={18} style={{ color: RISK_COLORS[alert.level] }} className="mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="text-sm font-semibold text-slate-100">{alert.title}</h4>
            <div className="flex items-center gap-2 mt-1">
              <RiskBadge level={alert.level} size="sm" />
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <MapPin size={11} /> {alert.zoneName}
              </span>
              <span className="text-xs text-slate-500">{timeAgo(alert.timestamp)}</span>
            </div>
          </div>
        </div>
        <span className="text-xs tabular-nums text-slate-500">{alert.confidence}% conf.</span>
      </div>

      <p className="text-sm text-slate-400 mb-2 ml-7">{alert.summary}</p>

      <div className="ml-7 p-2 bg-amber-500/5 border border-amber-500/20 rounded-md mb-2">
        <p className="text-xs text-amber-400/90">
          <span className="font-semibold">Action:</span> {alert.recommendedAction}
        </p>
      </div>

      <div className="flex items-center justify-between ml-7">
        <span className="demo-label">Simulated</span>
        {onAcknowledge && !alert.acknowledged ? (
          <button
            onClick={() => onAcknowledge(alert.id)}
            className="flex items-center gap-1 text-xs text-slate-400 hover:text-accent-400 transition-colors"
          >
            <CheckCircle2 size={13} /> Acknowledge
          </button>
        ) : alert.acknowledged ? (
          <span className="flex items-center gap-1 text-xs text-sev-safe">
            <CheckCircle2 size={13} /> Acknowledged
          </span>
        ) : null}
      </div>
    </div>
  );
}
