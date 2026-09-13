import type { AlertItem } from '@/types/risk';
import AlertCard from './AlertCard';

interface AlertListProps {
  alerts: AlertItem[];
  onAcknowledge?: (alertId: string) => void;
}

export default function AlertList({ alerts, onAcknowledge }: AlertListProps) {
  if (alerts.length === 0) {
    return (
      <div className="text-sm text-slate-500 text-center py-8">
        No active alerts.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {alerts.map((alert) => (
        <AlertCard key={alert.id} alert={alert} onAcknowledge={onAcknowledge} />
      ))}
    </div>
  );
}
