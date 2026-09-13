import type { KpiSummary } from '@/types/risk';
import KpiCard from '@/components/common/KpiCard';
import { ShieldAlert, Users, Bell, Gauge, MapPin } from 'lucide-react';

interface KpiRowProps {
  kpis: KpiSummary;
}

export default function KpiRow({ kpis }: KpiRowProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3">
      <KpiCard
        label="Critical Zones"
        value={kpis.criticalCount}
        icon={ShieldAlert}
        iconColor="#ef4444"
        sublabel={`of ${kpis.totalZones}`}
      />
      <KpiCard
        label="High Risk"
        value={kpis.highCount}
        icon={ShieldAlert}
        iconColor="#f97316"
        sublabel="zones"
      />
      <KpiCard
        label="Population Exposed"
        value={kpis.populationExposed.toLocaleString('en-IN')}
        icon={Users}
        iconColor="#f87171"
      />
      <KpiCard
        label="Active Alerts"
        value={kpis.activeAlerts}
        icon={Bell}
        iconColor="#fbbf24"
      />
      <KpiCard
        label="Avg Confidence"
        value={`${kpis.avgConfidence}%`}
        icon={Gauge}
        iconColor="#34d399"
      />
      <KpiCard
        label="Districts"
        value={kpis.districtsCovered}
        icon={MapPin}
        iconColor="#22d3ee"
        sublabel="covered"
      />
    </div>
  );
}
