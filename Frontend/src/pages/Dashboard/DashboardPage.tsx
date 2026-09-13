import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type {
  KpiSummary,
  ResponsePriorityItem,
  AlertItem,
  ExposureSummary,
} from '@/types/risk';
import {
  getResponsePriorityQueue,
  getKpis,
  getExposure,
} from '@/services/risk';
import { getAlerts } from '@/services/alerts';
import AppShell from '@/components/layout/AppShell';
import KpiRow from '@/components/dashboard/KpiRow';
import AlertList from '@/components/alerts/AlertList';
import ResponsePriority from '@/components/response/ResponsePriority';
import { Map as MapIcon, ArrowRight, Activity, ShieldAlert } from 'lucide-react';

export default function DashboardPage() {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState<KpiSummary | null>(null);
  const [priorities, setPriorities] = useState<ResponsePriorityItem[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<AlertItem[]>([]);
  const [totalExposure, setTotalExposure] = useState<ExposureSummary | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [kpiData, priorityData, alertData] = await Promise.all([
        getKpis(),
        getResponsePriorityQueue(),
        getAlerts(),
      ]);
      if (cancelled) return;
      setKpis(kpiData);
      setPriorities(priorityData);
      setRecentAlerts(alertData.slice(0, 4));

      // Aggregate exposure from the top priority zone
      const topZone = priorityData[0];
      if (topZone) {
        const exposure = await getExposure(topZone.zoneId);
        if (!cancelled) setTotalExposure(exposure);
      }

      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handlePriorityClick = (zoneId: string) => {
    // Navigate to risk-map with the selected zone
    navigate(`/risk-map?zone=${zoneId}`);
  };

  const handleExploreRiskMap = () => {
    navigate('/risk-map');
  };

  // Risk distribution bar data
  const riskDistribution = kpis
    ? [
        { label: 'CRITICAL', count: kpis.criticalCount, color: '#ef4444' },
        { label: 'HIGH', count: kpis.highCount, color: '#f97316' },
        { label: 'MODERATE', count: kpis.moderateCount, color: '#facc15' },
        { label: 'LOW', count: kpis.lowCount, color: '#84cc16' },
        { label: 'SAFE', count: kpis.safeCount, color: '#22c55e' },
      ]
    : [];

  const totalZones = kpis?.totalZones ?? 1;

  return (
    <AppShell title="Situation Overview">
      <div className="p-4 lg:p-6 space-y-4 max-w-[1800px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
            Loading situation overview...
          </div>
        ) : (
          <>
            {/* KPI row */}
            {kpis && <KpiRow kpis={kpis} />}

            {/* Main grid: alerts + risk distribution | priority queue */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Left: Critical alerts + risk distribution */}
              <div className="xl:col-span-2 space-y-4">
                {/* Critical alerts */}
                <div className="panel animate-fade-in">
                  <div className="panel-header">
                    <div className="flex items-center gap-2">
                      <h3 className="panel-title">Critical Alerts</h3>
                      <span className="text-[10px] font-semibold text-red-400/80 bg-red-500/10 px-2 py-0.5 rounded">
                        {recentAlerts.filter((a) => a.level === 'CRITICAL').length} CRITICAL
                      </span>
                    </div>
                    <span className="demo-label">Simulated</span>
                  </div>
                  <div className="p-4">
                    <AlertList alerts={recentAlerts} />
                  </div>
                </div>

                {/* Risk distribution + regional context */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Risk distribution bar */}
                  <div className="panel animate-fade-in">
                    <div className="panel-header">
                      <h3 className="panel-title">Risk Distribution</h3>
                      <span className="demo-label">Simulated</span>
                    </div>
                    <div className="p-4 space-y-3">
                      {/* Stacked bar */}
                      <div className="flex h-6 rounded-md overflow-hidden border border-ink-600">
                        {riskDistribution.map((r) => {
                          const width = (r.count / totalZones) * 100;
                          if (width === 0) return null;
                          return (
                            <div
                              key={r.label}
                              style={{
                                width: `${width}%`,
                                backgroundColor: r.color,
                                opacity: 0.85,
                              }}
                              className="transition-all duration-500"
                              title={`${r.label}: ${r.count} zones`}
                            />
                          );
                        })}
                      </div>
                      {/* Legend with counts */}
                      <div className="space-y-1.5">
                        {riskDistribution.map((r) => (
                          <div key={r.label} className="flex items-center justify-between text-xs">
                            <div className="flex items-center gap-2">
                              <span
                                className="inline-block w-3 h-3 rounded-sm"
                                style={{ backgroundColor: r.color }}
                              />
                              <span className="text-slate-300">{r.label}</span>
                            </div>
                            <span className="text-slate-400 tabular-nums">
                              {r.count} {r.count === 1 ? 'zone' : 'zones'}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Regional context: compact exposure summary */}
                  <div className="panel animate-fade-in">
                    <div className="panel-header">
                      <h3 className="panel-title">Regional Context</h3>
                      <span className="demo-label">Simulated</span>
                    </div>
                    <div className="p-4 space-y-3">
                      <div className="flex items-center gap-2">
                        <Activity size={14} className="text-accent-400" />
                        <span className="text-xs text-slate-400">Top Priority Zone Exposure</span>
                      </div>
                      {totalExposure ? (
                        <>
                          <div className="grid grid-cols-3 gap-2">
                            <div className="bg-ink-800/60 rounded-lg p-2.5 text-center">
                              <p className="text-lg font-bold text-slate-100 tabular-nums">
                                {totalExposure.villagesAffected}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Villages</p>
                            </div>
                            <div className="bg-ink-800/60 rounded-lg p-2.5 text-center">
                              <p className="text-lg font-bold text-slate-100 tabular-nums">
                                {totalExposure.populationExposed.toLocaleString('en-IN')}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-wider">People</p>
                            </div>
                            <div className="bg-ink-800/60 rounded-lg p-2.5 text-center">
                              <p className="text-lg font-bold text-slate-100 tabular-nums">
                                {totalExposure.roadsAffected}
                              </p>
                              <p className="text-[9px] text-slate-400 uppercase tracking-wider">Roads</p>
                            </div>
                          </div>
                          <div className="flex items-center justify-between pt-2 border-t border-ink-700">
                            <div className="flex items-center gap-2">
                              <ShieldAlert size={13} className="text-amber-400/70" />
                              <span className="text-[11px] text-slate-400">Connectivity</span>
                            </div>
                            <span
                              className="text-xs font-semibold uppercase tracking-wider"
                              style={{
                                color:
                                  totalExposure.connectivityStatus === 'critical'
                                    ? '#ef4444'
                                    : totalExposure.connectivityStatus === 'degraded'
                                    ? '#f97316'
                                    : '#22c55e',
                              }}
                            >
                              {totalExposure.connectivityStatus}
                            </span>
                          </div>
                        </>
                      ) : (
                        <p className="text-sm text-slate-500">Loading exposure data...</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Explore Risk Map action */}
                <button
                  onClick={handleExploreRiskMap}
                  className="panel panel-hover w-full flex items-center justify-between px-5 py-4 group cursor-pointer text-left animate-fade-in"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-accent-500/15 border border-accent-500/30 flex items-center justify-center">
                      <MapIcon size={20} className="text-accent-400" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-slate-100">Explore Risk Map</p>
                      <p className="text-xs text-slate-500">
                        Full GIS workspace — zones, layers, fly-to, and what-if scenarios
                      </p>
                    </div>
                  </div>
                  <ArrowRight
                    size={20}
                    className="text-slate-500 group-hover:text-accent-400 group-hover:translate-x-1 transition-all duration-200"
                  />
                </button>
              </div>

              {/* Right: Response priority queue */}
              <ResponsePriority
                items={priorities}
                selectedZoneId={null}
                onSelectZone={handlePriorityClick}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
