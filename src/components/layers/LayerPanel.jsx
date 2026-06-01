import { LAYER_IDS } from '../../layers';
import { useLayers } from '../../hooks/useLayers';
import './LayerPanel.css';

/**
 * Painel de controle das camadas (visibilidade e bloqueio).
 * FUTURE: reordenar camadas por drag-and-drop.
 */
export default function LayerPanel() {
  const { layers, toggleVisible, toggleLocked } = useLayers();

  return (
    <section className="sidebar__section layer-panel">
      <h2 className="sidebar__title">Camadas</h2>
      <ul className="layer-panel__list">
        {layers.map((layer) => {
          const isMapLayer = layer.id === LAYER_IDS.MAP;

          return (
            <li
              key={layer.id}
              className={`layer-panel__item ${!layer.visible ? 'layer-panel__item--hidden' : ''}`}
            >
              <div className="layer-panel__meta">
                <span className="layer-panel__order">{layer.order}</span>
                <div>
                  <span className="layer-panel__name">{layer.name}</span>
                  <span className="layer-panel__desc">{layer.description}</span>
                </div>
              </div>
              <div className="layer-panel__actions">
                <button
                  type="button"
                  className={`layer-panel__btn ${layer.visible ? 'layer-panel__btn--active' : ''}`}
                  onClick={() => toggleVisible(layer.id)}
                  title={layer.visible ? 'Ocultar camada' : 'Mostrar camada'}
                  aria-label={layer.visible ? 'Ocultar camada' : 'Mostrar camada'}
                  aria-pressed={layer.visible}
                >
                  {layer.visible ? '👁' : '👁‍🗨'}
                </button>
                <button
                  type="button"
                  className={`layer-panel__btn ${layer.locked ? 'layer-panel__btn--active' : ''}`}
                  onClick={() => !isMapLayer && toggleLocked(layer.id)}
                  disabled={isMapLayer}
                  title={
                    isMapLayer
                      ? 'Camada de mapa sempre bloqueada'
                      : layer.locked
                        ? 'Desbloquear edição'
                        : 'Bloquear edição'
                  }
                  aria-label={layer.locked ? 'Desbloquear edição' : 'Bloquear edição'}
                  aria-pressed={layer.locked}
                >
                  {layer.locked ? '🔒' : '🔓'}
                </button>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
