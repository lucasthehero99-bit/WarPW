import { useCallback, useEffect, useRef, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import EditorLayout from '../layouts/EditorLayout';
import Sidebar from '../components/Sidebar';
import MapCanvas from '../components/canvas/MapCanvas';
import { PlanProvider } from '../context/PlanContext';
import { useMaps } from '../hooks/useMaps';
import { readMap } from '../services/mapService';
import './NewPlanPage.css';

/**
 * Área principal de planejamento com sistema de camadas (LayerManager).
 * FUTURE: persistência local e exportação .twplan via PlanDocument.getSnapshot().
 */
export default function NewPlanPage() {
  return (
    <PlanProvider>
      <NewPlanEditor />
    </PlanProvider>
  );
}

function NewPlanEditor() {
  const navigate = useNavigate();
  const location = useLocation();
  const { maps, loading, error: mapsError, importMap, refresh } = useMaps();
  const [importError, setImportError] = useState(null);
  const [selectedMap, setSelectedMap] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [mapInfo, setMapInfo] = useState(null);
  const [zoomPercent, setZoomPercent] = useState(100);
  const [loadError, setLoadError] = useState(null);

  const zoomInRef = useRef(null);
  const zoomOutRef = useRef(null);
  const resetViewRef = useRef(null);

  const loadMap = useCallback(async (map) => {
    if (!map) return;
    setLoadError(null);
    try {
      const data = await readMap(map.path);
      setSelectedMap(map);
      setImageUrl(data.url);
      setMapInfo({
        fileName: data.fileName,
        width: null,
        height: null,
      });
    } catch (err) {
      setLoadError(err.message || 'Erro ao carregar mapa.');
      setImageUrl(null);
    }
  }, []);

  const handleSelectMap = useCallback(
    (map) => {
      loadMap(map);
    },
    [loadMap]
  );

  const handleImport = useCallback(async () => {
    setImportError(null);
    try {
      const imported = await importMap();
      if (imported) {
        await loadMap(imported);
      }
    } catch (err) {
      setImportError(err.message || 'Falha ao importar mapa.');
    }
  }, [importMap, loadMap]);

  useEffect(() => {
    if (loading || maps.length === 0 || selectedMap || location.state?.mapId) {
      return;
    }
    loadMap(maps[0]);
  }, [loading, maps, selectedMap, location.state?.mapId, loadMap]);

  useEffect(() => {
    const mapId = location.state?.mapId;
    if (!mapId || maps.length === 0) return;
    const map = maps.find((m) => m.id === mapId);
    if (map && map.id !== selectedMap?.id) {
      loadMap(map);
    }
  }, [location.state, maps, selectedMap?.id, loadMap]);

  const handleImageLoad = useCallback(({ width, height }) => {
    setLoadError(null);
    setMapInfo((prev) =>
      prev
        ? { ...prev, width, height }
        : { fileName: '', width, height }
    );
  }, []);

  const handleImageError = useCallback((message) => {
    setLoadError(message);
    setImageUrl(null);
  }, []);

  return (
    <EditorLayout
      onBack={() => navigate('/')}
      sidebar={
        <Sidebar
          maps={maps}
          selectedMapId={selectedMap?.id}
          onSelectMap={handleSelectMap}
          onImportMap={handleImport}
          onOpenLibrary={() => navigate('/biblioteca')}
          onZoomIn={() => zoomInRef.current?.()}
          onZoomOut={() => zoomOutRef.current?.()}
          onResetView={() => resetViewRef.current?.()}
          zoomPercent={zoomPercent}
          mapInfo={mapInfo}
          loading={loading}
          mapsError={mapsError}
        />
      }
    >
      <div className="plan-workspace">
        {(mapsError || importError) && (
          <div className="plan-error" role="alert">
            {importError || mapsError}
          </div>
        )}
        {loadError && (
          <div className="plan-error" role="alert">
            {loadError}
            <button type="button" onClick={refresh}>
              Tentar novamente
            </button>
          </div>
        )}
        <MapCanvas
          imageUrl={imageUrl}
          onImageLoad={handleImageLoad}
          onImageError={handleImageError}
          zoomInRef={zoomInRef}
          zoomOutRef={zoomOutRef}
          resetViewRef={resetViewRef}
          onZoomChange={setZoomPercent}
        />
      </div>
    </EditorLayout>
  );
}
