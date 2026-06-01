import { LAYER_IDS } from './layerIds.js';

/**
 * Configuração inicial das 6 camadas do planejamento TW.
 * A ordem (z-index) define a sobreposição na renderização.
 */
export const DEFAULT_LAYERS = [
  {
    id: LAYER_IDS.MAP,
    name: 'Mapa',
    description: 'Imagem de fundo da Territory War',
    visible: true,
    locked: true,
    order: 1,
  },
  {
    id: LAYER_IDS.OBJECTIVES,
    name: 'Objetivos',
    description: 'Torres, cristais, bases e pontos estratégicos',
    visible: true,
    locked: false,
    order: 2,
  },
  {
    id: LAYER_IDS.SQUADS,
    name: 'Esquadrões',
    description: 'Grupos de ataque e defesa',
    visible: true,
    locked: false,
    order: 3,
  },
  {
    id: LAYER_IDS.TACTICAL_ARROWS,
    name: 'Setas Táticas',
    description: 'Rotas, avanços e recuos',
    visible: true,
    locked: false,
    order: 4,
  },
  {
    id: LAYER_IDS.TEXTS,
    name: 'Textos',
    description: 'Observações, comandos e estratégias',
    visible: true,
    locked: false,
    order: 5,
  },
  {
    id: LAYER_IDS.MARKINGS,
    name: 'Marcações',
    description: 'Círculos, retângulos e destaques',
    visible: true,
    locked: false,
    order: 6,
  },
];
