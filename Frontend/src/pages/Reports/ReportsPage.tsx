import { useEffect, useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Panel from '@/components/common/Panel';
import { getReports, type ReportSummary } from '@/services/reports';
import { FileText, Download, Clock, MapPin } from 'lucide-react';

const statusStyles: Record<string, { color: string; bg: string }> = {
  draft: { color: '#facc15', bg: 'rgba(250,204,21,0.10)' },
  submitted: { color: '#22d3ee', bg: 'rgba(34,211,238,0.10)' },
  approved: { color: '#22c55e', bg: 'rgba(34,197,94,0.10)' },
};

export default function ReportsPage() {
  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getReports();
      if (!cancelled) {
        setReports(data);
        setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  return (
    <AppShell title="Reports">
      <div className="p-4 lg:p-6 max-w-[1200px] mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <FileText size={14} className="text-accent-400" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Situation Reports
          </span>
          <div className="flex-1 h-px bg-ink-700/60" />
          <span className="demo-label">Simulated</span>
        </div>

        <Panel noPadding>
          {loading ? (
            <div className="flex items-center justify-center py-12 text-slate-500 text-sm">
              Loading reports...
            </div>
          ) : (
            <div className="divide-y divide-ink-700">
              {reports.map((report) => {
                const style = statusStyles[report.status] ?? statusStyles.draft;
                return (
                  <div
                    key={report.id}
                    className="flex items-center justify-between px-4 py-3.5 hover:bg-ink-800/40 transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-ink-800 border border-ink-600 flex items-center justify-center">
                        <FileText size={16} className="text-slate-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {report.title}
                        </p>
                        <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <MapPin size={10} /> {report.zone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock size={10} /> {report.date}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded"
                        style={{ color: style.color, backgroundColor: style.bg }}
                      >
                        {report.status}
                      </span>
                      <button
                        aria-label={`Download report ${report.id}`}
                        className="text-slate-500 hover:text-accent-400 transition-colors"
                      >
                        <Download size={15} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Panel>

        <p className="text-xs text-slate-500 text-center">
          Report generation is not yet operational. Records shown are simulated demo data.
        </p>
      </div>
    </AppShell>
  );
}
