import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Panel from '@/components/common/Panel';
import RiskBadge from '@/components/common/RiskBadge';
import ForecastTimeline from '@/components/risk/ForecastTimeline';
import { runSimulation, type SimulationResult } from '@/services/simulation';
import { getResponsePriorityQueue } from '@/services/risk';
import type { ResponsePriorityItem } from '@/types/risk';
import { CloudRain, AlertTriangle } from 'lucide-react';

const SCENARIOS = [
  { label: 'Baseline', multiplier: 0, rainfall: 100 },
  { label: '+20% Rainfall', multiplier: 20, rainfall: 120 },
  { label: '+40% Rainfall', multiplier: 40, rainfall: 140 },
];

export default function SimulationPage() {
  const [priorities, setPriorities] = useState<ResponsePriorityItem[]>([]);
  const [selectedZoneId, setSelectedZoneId] = useState<string>('');
  const [activeScenario, setActiveScenario] = useState(0);
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getResponsePriorityQueue();
      if (cancelled) return;
      setPriorities(data);
      setSelectedZoneId(data[0]?.zoneId ?? '');
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedZoneId) return;
    let cancelled = false;
    (async () => {
      setRunning(true);
      const scenario = SCENARIOS[activeScenario];
      const res = await runSimulation({
        zoneId: selectedZoneId,
        rainfallMm: scenario.rainfall,
        durationHours: 24,
      });
      if (!cancelled) {
        setResult(res);
        setRunning(false);
      }
    })();
    return () => { cancelled = true; };
  }, [selectedZoneId, activeScenario]);

  return (
    <AppShell title="Simulation">
      <div className="p-4 lg:p-6 max-w-[1000px] mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <CloudRain size={14} className="text-accent-400" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Rainfall Scenario Simulator
          </span>
          <div className="flex-1 h-px bg-ink-700/60" />
          <span className="demo-label">Simulated</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
            Loading simulation data...
          </div>
        ) : (
          <>
            {/* Zone selector */}
            <Panel title="Select Risk Zone">
              <select
                value={selectedZoneId}
                onChange={(e) => setSelectedZoneId(e.target.value)}
                className="w-full bg-ink-800 border border-ink-600 rounded-lg px-3 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-accent-500/50"
              >
                {priorities.map((p) => (
                  <option key={p.zoneId} value={p.zoneId}>
                    {p.zoneName} — {p.riskScore}/100 ({p.riskLevel})
                  </option>
                ))}
              </select>
            </Panel>

            {/* Scenario selector */}
            <Panel title="Rainfall Scenario">
              <div className="flex gap-2">
                {SCENARIOS.map((scenario, i) => (
                  <button
                    key={scenario.label}
                    onClick={() => setActiveScenario(i)}
                    className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 border ${
                      activeScenario === i
                        ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                        : 'bg-ink-800/60 border-ink-600 text-slate-400 hover:text-slate-200 hover:border-ink-500'
                    }`}
                  >
                    {scenario.label}
                  </button>
                ))}
              </div>
            </Panel>

            {/* Results */}
            {result && (
              <>
                <Panel
                  title="Adjusted Risk Score"
                  headerExtra={
                    <div className="flex items-center gap-2">
                      <RiskBadge level={result.adjustedRiskLevel} size="sm" />
                      {running && (
                        <span className="text-[10px] text-slate-500 animate-pulse">Calculating...</span>
                      )}
                    </div>
                  }
                >
                  <div className="space-y-3">
                    <div className="flex items-baseline gap-2">
                      <span
                        className="text-3xl font-bold tabular-nums"
                        style={{ color: result.adjustedRiskLevel === 'CRITICAL' ? '#ef4444' : result.adjustedRiskLevel === 'HIGH' ? '#f97316' : result.adjustedRiskLevel === 'MODERATE' ? '#facc15' : '#22c55e' }}
                      >
                        {result.adjustedRiskScore}
                      </span>
                      <span className="text-sm text-slate-500">/ 100</span>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">{result.summary}</p>
                  </div>
                </Panel>

                <ForecastTimeline forecast={result.forecast} />

                <div className="flex items-start gap-2 text-xs text-amber-400/80 bg-amber-500/5 border border-amber-500/20 rounded-lg px-4 py-3">
                  <AlertTriangle size={14} className="mt-0.5 flex-shrink-0" />
                  <span>
                    <strong>SCENARIO SIMULATION</strong> — NOT A GUARANTEED PREDICTION.
                    Values are generated from a deterministic mock model for demonstration only.
                  </span>
                </div>
              </>
            )}
          </>
        )}
      </div>
    </AppShell>
  );
}
