import { useCallback, useEffect, useState } from 'react';
import { importMap, isElectron, listMaps } from '../services/mapService';

export function useMaps() {
  const [maps, setMaps] = useState([]);
  const [mapsDir, setMapsDir] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await listMaps();
      setMaps(result.maps ?? []);
      setMapsDir(result.mapsDir ?? null);
    } catch (err) {
      setError(err.message || 'Falha ao carregar mapas.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const handleImport = useCallback(async () => {
    if (!isElectron()) {
      throw new Error(
        'Importação só funciona no aplicativo desktop. Execute: npm run dev'
      );
    }

    const result = await importMap();
    if (result.canceled) {
      if (result.error) {
        throw new Error(result.error);
      }
      return null;
    }
    await refresh();
    return result.map ?? null;
  }, [refresh]);

  return {
    maps,
    mapsDir,
    loading,
    error,
    refresh,
    importMap: handleImport,
  };
}
