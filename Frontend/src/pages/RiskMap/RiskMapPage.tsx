import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import type {
  RiskZoneFeature,
  ForecastPoint,
  RiskContributor,
  ExposureSummary,
  WeatherSnapshot,
  ResponsePriorityItem,
} from '@/types/risk';
import {
  getZoneById,
  getForecast,
  getRiskExplanation,
  getExposure,
  getResponsePriorityQueue,
} from '@/services/risk';
import { getWeather } from '@/services/weather';
import AppShell from '@/components/layout/AppShell';
import RiskMap from '@/components/map/RiskMap';
import RiskScorePanel from '@/components/risk/RiskScorePanel';
import ForecastTimeline from '@/components/risk/ForecastTimeline';
import RiskExplanation from '@/components/risk/RiskExplanation';
import ExposurePanel from '@/components/impact/ExposurePanel';
import ResponsePriority from '@/components/response/ResponsePriority';
import { MousePointerClick } from 'lucide-react';

export default function RiskMapPage() {
  const [searchParams] = useSearchParams();
  const initialZone = searchParams.get('zone');

  const [selectedZoneId, setSelectedZoneId] = useState<string | null>(initialZone);
  const [selectedZone, setSelectedZone] = useState<RiskZoneFeature | null>(null);
  const [forecast, setForecast] = useState<ForecastPoint[]>([]);
  const [explanation, setExplanation] = useState<RiskContributor[]>([]);
  const [exposure, setExposure] = useState<ExposureSummary | null>(null);
  const [weather, setWeather] = useState<WeatherSnapshot | null>(null);
  const [priorities, setPriorities] = useState<ResponsePriorityItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [priorityData] = await Promise.all([
        getResponsePriorityQueue(),
      ]);
      if (cancelled) return;
      setPriorities(priorityData);
      setLoading(false);
    })();
    return () => { cancelled = true; };
  }, []);

  useEffect(() => {
    if (!selectedZoneId) {
      setSelectedZone(null);
      setForecast([]);
      setExplanation([]);
      setExposure(null);
      setWeather(null);
      return;
    }
    let cancelled = false;
    (async () => {
      const [zone, fc, expl, exp, wx] = await Promise.all([
        getZoneById(selectedZoneId),
        getForecast(selectedZoneId),
        getRiskExplanation(selectedZoneId),
        getExposure(selectedZoneId),
        getWeather(selectedZoneId),
      ]);
      if (cancelled) return;
      setSelectedZone(zone);
      setForecast(fc);
      setExplanation(expl);
      setExposure(exp);
      setWeather(wx);
    })();
    return () => { cancelled = true; };
  }, [selectedZoneId]);

  const handleSelectZone = (zoneId: string) => {
    setSelectedZoneId(zoneId);
  };

  return (
    <AppShell title="Risk Map">
      <div className="p-4 lg:p-6 space-y-4 max-w-[1800px] mx-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
            Loading risk map...
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
              {/* Large map — 2 columns on desktop */}
              <div className="xl:col-span-2 h-[520px] lg:h-[680px]">
                <RiskMap
                  selectedZoneId={selectedZoneId}
                  onSelectZone={handleSelectZone}
                />
              </div>

              {/* Side panel: risk score + forecast */}
              <div className="space-y-4">
                {selectedZone ? (
                  <>
                    <RiskScorePanel zone={selectedZone.properties} weather={weather} />
                    <ForecastTimeline forecast={forecast} />
                  </>
                ) : (
                  <div className="panel h-full flex flex-col items-center justify-center text-center p-8 animate-fade-in">
                    <MousePointerClick size={32} className="text-accent-400/30 mb-3" />
                    <p className="text-sm text-slate-300 font-medium">Select a Risk Zone</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-[220px] leading-relaxed">
                      Click any colored zone on the map, or pick from the priority queue below, to see its full risk assessment.
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              <RiskExplanation contributors={explanation} />
              <ExposurePanel exposure={exposure} />
              <ResponsePriority
                items={priorities}
                selectedZoneId={selectedZoneId}
                onSelectZone={handleSelectZone}
              />
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
