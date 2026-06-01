import { PLAN_EVENTS } from './layerEvents.js';

let elementIdCounter = 0;

function nextElementId() {
  elementIdCounter += 1;
  return `el-${Date.now()}-${elementIdCounter}`;
}

/**
 * Documento do plano — todos os elementos pertencem obrigatoriamente a uma camada.
 * FUTURE: multiplayer — replicar mutações via eventos PLAN_EVENTS.
 * FUTURE: replay — gravar lista ordenada de eventos com timestamp.
 */
export class PlanDocument {
  /**
   * @param {import('./LayerManager.js').LayerManager} layerManager
   */
  constructor(layerManager) {
    this.layerManager = layerManager;
    /** @type {object[]} */
    this._elements = [];
    /** @type {Set<(event: object) => void>} */
    this._listeners = new Set();
  }

  /** @returns {object[]} */
  getElements() {
    return [...this._elements];
  }

  /**
   * @param {string} layerId
   * @returns {object[]}
   */
  getElementsByLayer(layerId) {
    return this._elements.filter((el) => el.layerId === layerId);
  }

  /**
   * Elementos na ordem de renderização (camada → ordem interna).
   * @returns {object[]}
   */
  getElementsInRenderOrder() {
    const layerOrder = this.layerManager.getLayersInRenderOrder().map((l) => l.id);
    const rank = new Map(layerOrder.map((id, index) => [id, index]));

    return [...this._elements].sort((a, b) => {
      const layerDiff = (rank.get(a.layerId) ?? 0) - (rank.get(b.layerId) ?? 0);
      if (layerDiff !== 0) return layerDiff;
      return (a.zIndex ?? 0) - (b.zIndex ?? 0);
    });
  }

  /**
   * @param {object} element
   * @param {string} element.layerId — obrigatório
   * @param {string} element.type
   * @param {object} [element.data]
   * @param {number} [element.zIndex]
   */
  addElement(element) {
    this._validateLayerId(element.layerId);

    const record = {
      id: element.id ?? nextElementId(),
      layerId: element.layerId,
      type: element.type,
      data: element.data ?? {},
      zIndex: element.zIndex ?? 0,
      createdAt: Date.now(),
    };

    this._elements.push(record);
    this._emit({ type: PLAN_EVENTS.ELEMENT_ADDED, element: { ...record } });
    return record;
  }

  /**
   * @param {string} id
   * @param {object} patch
   */
  updateElement(id, patch) {
    const index = this._elements.findIndex((el) => el.id === id);
    if (index === -1) {
      throw new Error(`Elemento não encontrado: ${id}`);
    }

    if (patch.layerId) {
      this._validateLayerId(patch.layerId);
    }

    this._elements[index] = {
      ...this._elements[index],
      ...patch,
      data: patch.data
        ? { ...this._elements[index].data, ...patch.data }
        : this._elements[index].data,
    };

    this._emit({
      type: PLAN_EVENTS.ELEMENT_UPDATED,
      element: { ...this._elements[index] },
    });
  }

  /**
   * @param {string} id
   */
  removeElement(id) {
    const index = this._elements.findIndex((el) => el.id === id);
    if (index === -1) return false;

    const [removed] = this._elements.splice(index, 1);
    this._emit({ type: PLAN_EVENTS.ELEMENT_REMOVED, elementId: id, element: removed });
    return true;
  }

  reset() {
    this._elements = [];
    this._emit({ type: PLAN_EVENTS.PLAN_RESET });
  }

  getSnapshot() {
    return {
      version: 1,
      timestamp: Date.now(),
      elements: this._elements.map((el) => ({ ...el, data: { ...el.data } })),
    };
  }

  applySnapshot(snapshot) {
    if (!snapshot?.elements) return;
    snapshot.elements.forEach((el) => this._validateLayerId(el.layerId));
    this._elements = snapshot.elements.map((el) => ({ ...el }));
    this._emit({ type: PLAN_EVENTS.PLAN_RESET, source: 'snapshot' });
  }

  /**
   * @param {(event: object) => void} listener
   */
  subscribe(listener) {
    this._listeners.add(listener);
    return () => this._listeners.delete(listener);
  }

  /**
   * @param {string} layerId
   */
  _validateLayerId(layerId) {
    if (!layerId) {
      throw new Error('layerId é obrigatório em todo elemento do plano.');
    }
    if (!this.layerManager.hasLayer(layerId)) {
      throw new Error(
        `layerId "${layerId}" não existe. Registre a camada no LayerManager antes de adicionar elementos.`
      );
    }
  }

  /**
   * @param {object} event
   */
  _emit(event) {
    this._listeners.forEach((listener) =>
      listener({ ...event, timestamp: Date.now() })
    );
  }
}
