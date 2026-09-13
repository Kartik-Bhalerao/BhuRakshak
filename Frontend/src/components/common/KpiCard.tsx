import type { LucideIcon } from 'lucide-react';

interface KpiCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  iconColor?: string;
  sublabel?: string;
  trend?: number;
}

export default function KpiCard({
  label,
  value,
  icon: Icon,
  iconColor = '#22d3ee',
  sublabel,
  trend,
}: KpiCardProps) {
  return (
    <div className="panel panel-hover p-4 flex items-center gap-4 min-h-[104px] animate-fade-in">
      <div
        className="flex-shrink-0 w-11 h-11 rounded-lg flex items-center justify-center"
        style={{ backgroundColor: `${iconColor}15`, border: `1px solid ${iconColor}30` }}
      >
        <Icon size={20} style={{ color: iconColor }} />
      </div>
      <div className="min-w-0 flex-1">
       <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider leading-tight">
          {label}
       </p>
        <div className="flex items-baseline gap-2">
          <p className="text-xl font-bold text-slate-100 tabular-nums">{value}</p>
          {sublabel && <p className="text-xs text-slate-500">{sublabel}</p>}
        </div>
      </div>
      {trend !== undefined && (
        <span
          className={`text-xs font-semibold tabular-nums ${
            trend > 0 ? 'text-sev-high' : trend < 0 ? 'text-sev-safe' : 'text-slate-500'
          }`}
        >
          {trend > 0 ? '↑' : trend < 0 ? '↓' : '–'} {Math.abs(trend)}
        </span>
      )}
    </div>
  );
}
