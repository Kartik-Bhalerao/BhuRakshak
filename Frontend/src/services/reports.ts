import { simulateLatency } from './api';

export interface ReportSummary {
  id: string;
  title: string;
  zone: string;
  date: string;
  status: 'draft' | 'submitted' | 'approved';
}

const mockReports: ReportSummary[] = [
  { id: 'RPT-001', title: 'Dibang Valley Landsslide Risk Assessment', zone: 'Z001', date: '2026-09-04', status: 'submitted' },
  { id: 'RPT-002', title: 'Tirap Frontier Situation Report', zone: 'Z007', date: '2026-09-04', status: 'approved' },
  { id: 'RPT-003', title: 'Lohit Basin Monitoring Summary', zone: 'Z002', date: '2026-09-03', status: 'draft' },
];

export async function getReports(): Promise<ReportSummary[]> {
  return simulateLatency(mockReports);
}
