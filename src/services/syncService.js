/**
 * FUTURE: Multiplayer — sincronização de camadas e elementos via Socket.IO.
 *
 * Fluxo planejado:
 * 1. LayerManager.subscribe() e PlanDocument.subscribe() emitem eventos locais.
 * 2. syncService.broadcast(event) envia para a sala.
 * 3. syncService.applyRemote(event) chama layerManager.applySnapshot / planDocument.applySnapshot.
 */

export const syncService = {
  connect() {
    throw new Error('Multiplayer não implementado.');
  },
  disconnect() {},
  broadcast() {},
  applyRemote() {},
};
