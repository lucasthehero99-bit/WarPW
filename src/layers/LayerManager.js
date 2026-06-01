import { DEFAULT_LAYERS } from './defaultLayers.js';
import { LAYER_EVENTS } from './layerEvents.js';

/**
 * Gerenciador central de camadas (visibilidade, bloqueio, ordem).
 * FUTURE: multiplayer — aplicar patches remotos via applySnapshot / emit handlers.
 * FUTURE: replay — serializar getSnapshot() em cada frame da timeline.
 */
export class LayerManager {
  /** @param {import('./defaultLayers.js').DEFAULT_LAYERS} [initialLayers] */
  constructor(initialLayers = DEFAULT_LAYERS) {
    /** @type {Map<string, object>} */
    this._layers = new Map();
    /** @type {Set<(event: object) => void>} */
    this._listeners = new Set();

    initialLayers.forEach((layer) => {
      this._layers.set(layer.id, { ...layer });
    });
  }

  /** @returns {object[]} Camadas ordenadas por z-index (order ascendente). */
  getLayersInRenderOrder() {
    return Array.from(this._layers.values()).sort((a, b) => a.order - b.order);
  }

  /** @returns {object[]} */
  getLayers() {
    return this.getLayersInRenderOrder();
  }

  /**
   * @param {string} id
   * @returns {object | undefined}
   */
  getLayer(id) {
    return this._layers.get(id);
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  hasLayer(id) {
    return this._layers.has(id);
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  isVisible(id) {
    return this._layers.get(id)?.visible ?? false;
  }

  /**
   * @param {string} id
   * @returns {boolean}
   */
  isLocked(id) {
    return this._layers.get(id)?.locked ?? true;
  }

  /**
   * Camada editável: visível e desbloqueada.
   * @param {string} id
   */
  canEdit(id) {
    const layer = this._layers.get(id);
    if (!layer) return false;
    return layer.visible && !layer.locked;
  }

  /**
   * @param {string} id
   * @param {boolean} visible
   */
  setVisible(id, visible) {
    const layer = this._requireLayer(id);
    if (layer.visible === visible) return;
    layer.visible = visible;
    this._emit({
      type: LAYER_EVENTS.LAYER_VISIBILITY,
      layerId: id,
      visible,
    });
  }

  /**
   * @param {string} id
   */
  showLayer(id) {
    this.setVisible(id, true);
  }

  /**
   * @param {string} id
   */
  hideLayer(id) {
    this.setVisible(id, false);
  }

  /**
   * @param {string} id
   */
  toggleVisible(id) {
    const layer = this._requireLayer(id);
    this.setVisible(id, !layer.visible);
  }

  /**
   * @param {string} id
   * @param {boolean} locked
   */
  setLocked(id, locked) {
    const layer = this._requireLayer(id);
    if (layer.locked === locked) return;
    layer.locked = locked;
    this._emit({
      type: LAYER_EVENTS.LAYER_LOCK,
      layerId: id,
      locked,
    });
  }

  /**
   * @param {string} id
   */
  lockLayer(id) {
    this.setLocked(id, true);
  }

  /**
   * @param {string} id
   */
  unlockLayer(id) {
    this.setLocked(id, false);
  }

  /**
   * @param {string} id
   */
  toggleLocked(id) {
    const layer = this._requireLayer(id);
    this.setLocked(id, !layer.locked);
  }

  /**
   * @param {string} id
   * @param {number} order
   */
  setOrder(id, order) {
    const layer = this._requireLayer(id);
    if (layer.order === order) return;
    layer.order = order;
    this._emit({
      type: LAYER_EVENTS.LAYER_ORDER,
      layerId: id,
      order,
    });
  }

  /**
   * Snapshot para replay / sincronização.
   * FUTURE: incluir checksum e authorId em eventos multiplayer.
   */
  getSnapshot() {
    return {
      version: 1,
      timestamp: Date.now(),
      layers: this.getLayers().map((l) => ({ ...l })),
    };
  }

  /**
   * Restaura estado de camadas (replay ou sync remoto).
   * @param {{ layers: object[] }} snapshot
   */
  applySnapshot(snapshot) {
    if (!snapshot?.layers?.length) return;

    snapshot.layers.forEach((layer) => {
      if (!this._layers.has(layer.id)) return;
      const current = this._layers.get(layer.id);
      this._layers.set(layer.id, {
        ...current,
        visible: layer.visible ?? current.visible,
        locked: layer.locked ?? current.locked,
        order: layer.order ?? current.order,
      });
    });

    this._emit({ type: LAYER_EVENTS.LAYERS_CHANGED, source: 'snapshot' });
  }

  /**
   * @param {(event: object) => void} listener
   * @returns {() => void} unsubscribe
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * @param {string} id
   */
  _requireLayer(id) {
    const layer = this._layers.get(id);
    if (!layer) {
      throw new Error(`Camada inválida: "${id}". Todo elemento deve pertencer a uma camada registrada.`);
    }
    return layer;
  }

  /**
   * @param {object} event
   */
  _emit(event) {
    const payload = {
      ...event,
      timestamp: Date.now(),
    };
    this._listeners.forEach((listener) => listener(payload));
    this._listeners.forEach((listener) =>
      listener({ type: LAYER_EVENTS.LAYERS_CHANGED, ...payload })
    );
  }
}
