import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import RiskMapPage from '@/pages/RiskMap/RiskMapPage';
import AlertsPage from '@/pages/Alerts/AlertsPage';
import ReportsPage from '@/pages/Reports/ReportsPage';
import AnalyticsPage from '@/pages/Analytics/AnalyticsPage';
import SimulationPage from '@/pages/Simulation/SimulationPage';
import SettingsPage from '@/pages/Settings/SettingsPage';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/risk-map" element={<RiskMapPage />} />
        <Route path="/alerts" element={<AlertsPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/simulation" element={<SimulationPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </BrowserRouter>
  );
}
