import type { RiskContributor } from '@/types/risk';
import Panel from '@/components/common/Panel';
import { HelpCircle } from 'lucide-react';

interface RiskExplanationProps {
  contributors: RiskContributor[];
}

export default function RiskExplanation({ contributors }: RiskExplanationProps) {
  return (
    <Panel
      title="Risk Explanation"
      headerExtra={
        <span className="demo-label">Simulated</span>
      }
    >
      {contributors.length === 0 ? (
        <div className="flex items-center gap-2 text-sm text-slate-500 py-4">
          <HelpCircle size={16} />
          Select a zone to see risk factors.
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-slate-400 mb-2">
            Why is this zone flagged? Top contributing factors:
          </p>
          {contributors.map((c, i) => (
            <div key={i}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm text-slate-200">{c.factor}</span>
                <span className="text-xs font-semibold text-slate-300 tabular-nums">{c.value}</span>
              </div>
              <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden mb-1">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${c.weight}%`,
                    backgroundColor: '#22d3ee',
                    opacity: 0.7,
                  }}
                />
              </div>
              <p className="text-[11px] text-slate-500">{c.description}</p>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}
