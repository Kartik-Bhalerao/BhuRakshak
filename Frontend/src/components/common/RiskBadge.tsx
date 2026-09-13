import type { RiskLevel } from '@/types/risk';
import { RISK_COLORS, RISK_TEXT_CLASSES } from '@/utils/riskColors';

interface RiskBadgeProps {
  level: RiskLevel;
  size?: 'sm' | 'md' | 'lg';
}

export default function RiskBadge({ level, size = 'md' }: RiskBadgeProps) {
  const sizes = {
    sm: 'text-[10px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3 py-1.5',
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border font-semibold uppercase tracking-wider ${sizes[size]}`}
      style={{
        color: RISK_COLORS[level],
        borderColor: `${RISK_COLORS[level]}40`,
        backgroundColor: `${RISK_COLORS[level]}15`,
      }}
    >
      <span
        className="inline-block w-1.5 h-1.5 rounded-full"
        style={{ backgroundColor: RISK_COLORS[level] }}
      />
      {level}
    </span>
  );
}

export function RiskScore({ score, level }: { score: number; level: RiskLevel }) {
  return (
    <div className="flex items-baseline gap-1">
      <span
        className={`text-2xl font-bold tabular-nums ${RISK_TEXT_CLASSES[level]}`}
        style={{ color: RISK_COLORS[level] }}
      >
        {score}
      </span>
      <span className="text-sm text-slate-500 font-medium">/ 100</span>
    </div>
  );
}
