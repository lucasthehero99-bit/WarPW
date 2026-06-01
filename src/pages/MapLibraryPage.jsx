import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import { useMaps } from '../hooks/useMaps';
import { openMapsFolder } from '../services/mapService';
import './MapLibraryPage.css';

export default function MapLibraryPage() {
  const navigate = useNavigate();
  const { maps, mapsDir, loading, refresh, importMap } = useMaps();

  const handleUseMap = (map) => {
    navigate('/plano', { state: { mapId: map.id } });
  };

  return (
    <div className="library-page">
      <header className="library-page__header">
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← Voltar
        </Button>
        <h1>Biblioteca de Mapas</h1>
        <div className="library-page__actions">
          <Button size="small" variant="primary" onClick={importMap}>
            Importar Mapa
          </Button>
          <Button size="small" variant="secondary" onClick={openMapsFolder}>
            Abrir Pasta
          </Button>
          <Button size="small" variant="ghost" onClick={refresh}>
            Atualizar
          </Button>
        </div>
      </header>

      <p className="library-page__path">
        {mapsDir ? `Pasta: ${mapsDir}` : 'Execute no aplicativo desktop para acessar mapas locais.'}
      </p>

      <div className="library-page__grid">
        {loading && <p className="library-page__empty">Carregando…</p>}
        {!loading && maps.length === 0 && (
          <p className="library-page__empty">
            Adicione imagens PNG, JPG, JPEG ou WEBP na pasta <code>maps</code> ou importe um arquivo.
          </p>
        )}
        {maps.map((map) => (
          <article key={map.id} className="library-card">
            <h2>{map.name}</h2>
            <p className="library-card__file">{map.fileName}</p>
            <Button size="small" variant="primary" onClick={() => handleUseMap(map)}>
              Usar no Plano
            </Button>
          </article>
        ))}
      </div>
    </div>
  );
}
