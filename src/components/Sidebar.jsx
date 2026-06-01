import Button from './Button';
import LayerPanel from './layers/LayerPanel';
import './Sidebar.css';

/**
 * Painel lateral de ferramentas e controle de camadas.
 */
export default function Sidebar({
  maps,
  selectedMapId,
  onSelectMap,
  onImportMap,
  onOpenLibrary,
  onZoomIn,
  onZoomOut,
  onResetView,
  zoomPercent,
  mapInfo,
  loading,
  mapsError,
}) {
  return (
    <aside className="sidebar">
      <section className="sidebar__section">
        <h2 className="sidebar__title">Mapas</h2>
        <div className="sidebar__map-list">
          {mapsError && <p className="sidebar__hint sidebar__hint--error">{mapsError}</p>}
          {loading && <p className="sidebar__hint">Carregando mapas…</p>}
          {!loading && !mapsError && maps.length === 0 && (
            <p className="sidebar__hint">Nenhum mapa na pasta /maps. Importe ou adicione imagens.</p>
          )}
          {maps.map((map) => (
            <button
              key={map.id}
              type="button"
              className={`sidebar__map-item ${selectedMapId === map.id ? 'sidebar__map-item--active' : ''}`}
              onClick={() => onSelectMap(map)}
            >
              {map.name}
            </button>
          ))}
        </div>
      </section>

      <section className="sidebar__section sidebar__actions">
        <Button size="small" variant="primary" className="sidebar__full-btn" onClick={onImportMap}>
          Importar Mapa
        </Button>
        <Button size="small" variant="secondary" className="sidebar__full-btn" onClick={onOpenLibrary}>
          Biblioteca
        </Button>
      </section>

      <LayerPanel />

      <section className="sidebar__section">
        <h2 className="sidebar__title">Zoom</h2>
        <div className="sidebar__zoom-controls">
          <Button size="small" variant="secondary" onClick={onZoomOut}>
            −
          </Button>
          <span className="sidebar__zoom-value">{zoomPercent}%</span>
          <Button size="small" variant="secondary" onClick={onZoomIn}>
            +
          </Button>
        </div>
        <Button size="small" variant="ghost" className="sidebar__reset" onClick={onResetView}>
          Centralizar mapa
        </Button>
      </section>

      <section className="sidebar__section sidebar__info">
        <h2 className="sidebar__title">Informações</h2>
        {mapInfo ? (
          <dl className="sidebar__info-list">
            <div>
              <dt>Arquivo</dt>
              <dd>{mapInfo.fileName}</dd>
            </div>
            {mapInfo.width ? (
              <div>
                <dt>Dimensões</dt>
                <dd>
                  {mapInfo.width} × {mapInfo.height} px
                </dd>
              </div>
            ) : (
              <div>
                <dt>Status</dt>
                <dd>Carregando imagem…</dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="sidebar__hint">Selecione ou importe um mapa.</p>
        )}
      </section>

    </aside>
  );
}
