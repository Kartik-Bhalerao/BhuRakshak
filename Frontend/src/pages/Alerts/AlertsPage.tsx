import { useEffect, useState } from 'react';
import type { AlertItem } from '@/types/risk';
import { getAlerts, acknowledgeAlert } from '@/services/alerts';
import AppShell from '@/components/layout/AppShell';
import AlertList from '@/components/alerts/AlertList';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const data = await getAlerts();
      if (cancelled) return;
      setAlerts(data);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  const handleAcknowledge = async (alertId: string) => {
    await acknowledgeAlert(alertId);
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)),
    );
  };

  return (
    <AppShell title="Alerts">
      <div className="p-4 lg:p-6 max-w-3xl mx-auto">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-slate-300 mb-1">Active Alerts</h3>
          <p className="text-xs text-slate-500">
            Real-time risk alerts for monitored zones. All data is simulated.
          </p>
        </div>
        {loading ? (
          <div className="text-sm text-slate-500 text-center py-8">Loading alerts...</div>
        ) : (
          <AlertList alerts={alerts} onAcknowledge={handleAcknowledge} />
        )}
      </div>
    </AppShell>
  );
}
