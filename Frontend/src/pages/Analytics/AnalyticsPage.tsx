import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Panel from '@/components/common/Panel';
import { getKpis } from '@/services/risk';
import type { KpiSummary } from '@/types/risk';
import { RISK_COLORS } from '@/utils/riskColors';
import { BarChart3, TrendingUp, CloudRain, Users, ShieldAlert } from 'lucide-react';

export default function AnalyticsPage() {
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getKpis();
      if (!cancelled) {
        setKpis(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const distribution = kpis
    ? [
        { label: 'CRITICAL', count: kpis.criticalCount, color: RISK_COLORS.CRITICAL },
        { label: 'HIGH', count: kpis.highCount, color: RISK_COLORS.HIGH },
        { label: 'MODERATE', count: kpis.moderateCount, color: RISK_COLORS.MODERATE },
        { label: 'LOW', count: kpis.lowCount, color: RISK_COLORS.LOW },
        { label: 'SAFE', count: kpis.safeCount, color: RISK_COLORS.SAFE },
      ]
    : [];

  const maxCount = Math.max(...distribution.map((d) => d.count), 1);

  return (
    <AppShell title="Analytics">
      <div className="p-4 lg:p-6 max-w-[1200px] mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BarChart3 size={14} className="text-accent-400" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Risk Analytics
          </span>
          <div className="flex-1 h-px bg-ink-700/60" />
          <span className="demo-label">Simulated</span>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
            Loading analytics...
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Risk distribution chart */}
            <Panel title="Risk Distribution">
              <div className="space-y-3">
                {distribution.map((d) => (
                  <div key={d.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300">{d.label}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{d.count} zones</span>
                    </div>
                    <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(d.count / maxCount) * 100}%`,
                          backgroundColor: d.color,
                          opacity: 0.8,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Summary stats */}
            <Panel title="Summary Statistics">
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-ink-800/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <ShieldAlert size={14} className="text-red-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Total Zones</span>
                  </div>
                  <p className="text-xl font-bold text-slate-100 tabular-nums">{kpis?.totalZones}</p>
                </div>
                <div className="bg-ink-800/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <Users size={14} className="text-amber-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Pop. Exposed</span>
                  </div>
                  <p className="text-xl font-bold text-slate-100 tabular-nums">
                    {kpis?.populationExposed.toLocaleString('en-IN')}
                  </p>
                </div>
                <div className="bg-ink-800/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <CloudRain size={14} className="text-accent-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Active Alerts</span>
                  </div>
                  <p className="text-xl font-bold text-slate-100 tabular-nums">{kpis?.activeAlerts}</p>
                </div>
                <div className="bg-ink-800/60 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-1">
                    <TrendingUp size={14} className="text-green-400" />
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider">Avg Confidence</span>
                  </div>
                  <p className="text-xl font-bold text-slate-100 tabular-nums">{kpis?.avgConfidence}%</p>
                </div>
              </div>
            </Panel>

            {/* Priority distribution */}
            <Panel title="Priority Distribution">
              <div className="space-y-3">
                {[
                  { label: 'P1 — Critical Response', count: kpis?.criticalCount ?? 0, color: '#ef4444' },
                  { label: 'P2 — Monitor & Prepare', count: kpis?.highCount ?? 0, color: '#f97316' },
                  { label: 'P3 — Routine Watch', count: kpis?.moderateCount ?? 0, color: '#facc15' },
                ].map((p) => (
                  <div key={p.label}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs text-slate-300">{p.label}</span>
                      <span className="text-xs text-slate-400 tabular-nums">{p.count}</span>
                    </div>
                    <div className="h-2 bg-ink-800 rounded-full overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                          width: `${(p.count / Math.max(kpis?.totalZones ?? 1, 1)) * 100}%`,
                          backgroundColor: p.color,
                          opacity: 0.7,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Panel>

            {/* Rainfall trend placeholder */}
            <Panel title="Rainfall Trend" headerExtra={<span className="demo-label">Simulated</span>}>
              <div className="flex items-center justify-center h-40 text-center">
                <div>
                  <CloudRain size={32} className="text-slate-600 mx-auto mb-2" />
                  <p className="text-xs text-slate-500">
                    Rainfall trend charts will appear here when live weather data is connected.
                  </p>
                </div>
              </div>
            </Panel>
          </div>
        )}

        <p className="text-xs text-slate-500 text-center">
          Analytics shown are derived from simulated demo data, not live monitoring.
        </p>
      </div>
    </AppShell>
  );
}
