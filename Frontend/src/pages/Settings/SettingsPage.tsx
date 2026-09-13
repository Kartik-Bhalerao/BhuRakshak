import { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import Panel from '@/components/common/Panel';
import { Settings as SettingsIcon, Map, Eye, Bell, Zap } from 'lucide-react';

export default function SettingsPage() {
  const [mapStyle, setMapStyle] = useState('dark');
  const [reducedMotion, setReducedMotion] = useState(false);
  const [layerVisibilityDefault, setLayerVisibilityDefault] = useState(true);
  const [displayDensity, setDisplayDensity] = useState('comfortable');
  const [alertNotifications, setAlertNotifications] = useState(true);

  const toggleRow = (
    label: string,
    description: string,
    value: boolean,
    onChange: (v: boolean) => void,
  ) => (
    <div className="flex items-center justify-between py-3 border-b border-ink-700 last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium text-slate-200">{label}</p>
        <p className="text-xs text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        aria-pressed={value}
        aria-label={`Toggle ${label}`}
        className={`relative w-9 h-5 rounded-full transition-colors flex-shrink-0 ${
          value ? 'bg-accent-500/40' : 'bg-ink-600'
        }`}
      >
        <span
          className={`absolute top-0.5 w-4 h-4 rounded-full bg-slate-200 transition-transform ${
            value ? 'translate-x-4' : 'translate-x-0.5'
          }`}
        />
      </button>
    </div>
  );

  return (
    <AppShell title="Settings">
      <div className="p-4 lg:p-6 max-w-[800px] mx-auto space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <SettingsIcon size={14} className="text-accent-400" />
          <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">
            Command Centre Settings
          </span>
          <div className="flex-1 h-px bg-ink-700/60" />
        </div>

        {/* Map style */}
        <Panel title="Map Style" headerExtra={<Map size={14} className="text-slate-500" />}>
          <div className="grid grid-cols-3 gap-2">
            {['dark', 'terrain', 'satellite'].map((style) => (
              <button
                key={style}
                onClick={() => setMapStyle(style)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium capitalize transition-all duration-200 border ${
                  mapStyle === style
                    ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                    : 'bg-ink-800/60 border-ink-600 text-slate-400 hover:text-slate-200'
                }`}
              >
                {style}
              </button>
            ))}
          </div>
          <p className="text-xs text-slate-500 mt-2">
            Terrain and satellite base layers require additional tile sources. Dark style is active for this demo.
          </p>
        </Panel>

        {/* Display preferences */}
        <Panel title="Display" headerExtra={<Eye size={14} className="text-slate-500" />}>
          {toggleRow(
            'Reduced Motion',
            'Minimise animations and transitions',
            reducedMotion,
            setReducedMotion,
          )}
          {toggleRow(
            'Show All Layers by Default',
            'Enable all map layers when the Risk Map loads',
            layerVisibilityDefault,
            setLayerVisibilityDefault,
          )}
          <div className="py-3 border-b border-ink-700 last:border-0">
            <p className="text-sm font-medium text-slate-200 mb-1">Display Density</p>
            <p className="text-xs text-slate-500 mb-2">Controls spacing and information density</p>
            <div className="flex gap-2">
              {['compact', 'comfortable', 'spacious'].map((density) => (
                <button
                  key={density}
                  onClick={() => setDisplayDensity(density)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all duration-200 border ${
                    displayDensity === density
                      ? 'bg-accent-500/10 border-accent-500/30 text-accent-400'
                      : 'bg-ink-800/60 border-ink-600 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {density}
                </button>
              ))}
            </div>
          </div>
        </Panel>

        {/* Notifications */}
        <Panel title="Notifications" headerExtra={<Bell size={14} className="text-slate-500" />}>
          {toggleRow(
            'Alert Notifications',
            'Show visual alerts for critical and high-risk zones',
            alertNotifications,
            setAlertNotifications,
          )}
        </Panel>

        {/* About */}
        <Panel title="About" headerExtra={<Zap size={14} className="text-slate-500" />}>
          <div className="space-y-1 text-xs text-slate-400">
            <p>BhuRakshak Command Centre — Frontend MVP</p>
            <p className="text-slate-500">
              All data shown is simulated for demonstration. No live government, satellite, or sensor data is used.
            </p>
          </div>
        </Panel>

        <p className="text-xs text-slate-500 text-center">
          Settings are local frontend preferences only. They are not persisted across sessions in this demo.
        </p>
      </div>
    </AppShell>
  );
}
