import { LAYER_IDS } from '../../../layers';
import MapLayerContent from './MapLayerContent';

/**
 * Renderiza o conteúdo de uma camada lógica.
 * Novos tipos de elemento devem ser registrados aqui por layerId.
 */
export default function LayerContent({ layerId, context }) {
  switch (layerId) {
    case LAYER_IDS.MAP:
      return <MapLayerContent {...context} />;

    case LAYER_IDS.OBJECTIVES:
    case LAYER_IDS.SQUADS:
    case LAYER_IDS.TACTICAL_ARROWS:
    case LAYER_IDS.TEXTS:
    case LAYER_IDS.MARKINGS:
      // FUTURE: renderizar elementos de planDocument.getElementsByLayer(layerId)
      return null;

    default:
      return null;
  }
}
