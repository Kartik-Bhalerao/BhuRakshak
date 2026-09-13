import { useRef, useState } from 'react';
import { Upload, Trash2, ZoomIn, X } from 'lucide-react';
import { validateGeoJSON } from '@/utils/geojson';

interface GeoJsonImportProps {
  onAddLayer: (data: GeoJSON.FeatureCollection) => void;
  onRemoveLayer: () => void;
  onZoomToLayer: () => void;
  hasImportedData: boolean;
}

export default function GeoJsonImport({
  onAddLayer,
  onRemoveLayer,
  onZoomToLayer,
  hasImportedData,
}: GeoJsonImportProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    const result = validateGeoJSON(text);

    if (!result.valid || !result.data) {
      setError(result.error ?? 'Invalid GeoJSON');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setError(null);
    onAddLayer(result.data);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="space-y-2">
      <input
        ref={fileInputRef}
        type="file"
        accept=".geojson,.json,application/geo+json,application/json"
        onChange={handleFileSelect}
        className="hidden"
      />

      <button
        onClick={() => fileInputRef.current?.click()}
        aria-label="Import local GeoJSON file"
        className="flex items-center gap-1.5 bg-ink-900/90 border border-ink-600 rounded-lg px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:border-accent-500/50 hover:text-accent-400 transition-all duration-200 w-fit"
      >
        <Upload size={13} />
        Import GeoJSON
      </button>

      {hasImportedData && (
        <div className="space-y-1.5 bg-ink-900/95 border border-cyan-500/20 rounded-lg p-2.5 animate-slide-up">
          <p className="text-[9px] font-semibold text-cyan-400/80 uppercase tracking-wider">
            Local User Import
          </p>
          <div className="flex gap-1.5">
            <button
              onClick={onZoomToLayer}
              className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-accent-400 transition-colors"
            >
              <ZoomIn size={11} /> Zoom to Data
            </button>
            <span className="text-slate-600">|</span>
            <button
              onClick={onRemoveLayer}
              className="flex items-center gap-1 text-[10px] text-slate-300 hover:text-red-400 transition-colors"
            >
              <Trash2 size={11} /> Remove
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-2 text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-lg px-2.5 py-1.5 animate-fade-in">
          <X size={12} className="mt-0.5 flex-shrink-0" />
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            aria-label="Dismiss error"
            className="ml-auto text-red-400/60 hover:text-red-400"
          >
            <X size={12} />
          </button>
        </div>
      )}
    </div>
  );
}
