/**
 * Tipos de evento emitidos pelo LayerManager e PlanDocument.
 * FUTURE: multiplayer — replicar estes eventos via Socket.IO.
 * FUTURE: replay — gravar sequência destes eventos com timestamp.
 */
export const LAYER_EVENTS = {
  LAYERS_CHANGED: 'layers:changed',
  LAYER_VISIBILITY: 'layer:visibility',
  LAYER_LOCK: 'layer:lock',
  LAYER_ORDER: 'layer:order',
};

export const PLAN_EVENTS = {
  ELEMENT_ADDED: 'plan:element:added',
  ELEMENT_UPDATED: 'plan:element:updated',
  ELEMENT_REMOVED: 'plan:element:removed',
  PLAN_RESET: 'plan:reset',
};
