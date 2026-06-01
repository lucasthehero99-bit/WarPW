import { Group } from 'react-konva';
import LayerContent from './renderers/LayerContent';

/**
 * Agrupa o conteúdo de uma camada lógica dentro do viewport.
 * Respeita visibilidade e bloqueio de edição (listening).
 */
export default function LayerGroup({ layer, renderContext }) {
  if (!layer.visible) {
    return null;
  }

  return (
    <Group
      name={`layer-${layer.id}`}
      listening={!layer.locked}
      visible={layer.visible}
    >
      <LayerContent layerId={layer.id} context={renderContext} />
    </Group>
  );
}
