import { useCallback, useSyncExternalStore } from 'react';
import { usePlanContext } from '../context/PlanContext';

/**
 * Hook reativo para o LayerManager.
 */
export function useLayers() {
  const { layerManager } = usePlanContext();

  const layers = useSyncExternalStore(
    (onStoreChange) => layerManager.subscribe(onStoreChange),
    () => layerManager.getLayersInRenderOrder(),
    () => layerManager.getLayersInRenderOrder()
  );

  const showLayer = useCallback((id) => layerManager.showLayer(id), [layerManager]);
  const hideLayer = useCallback((id) => layerManager.hideLayer(id), [layerManager]);
  const toggleVisible = useCallback((id) => layerManager.toggleVisible(id), [layerManager]);
  const lockLayer = useCallback((id) => layerManager.lockLayer(id), [layerManager]);
  const unlockLayer = useCallback((id) => layerManager.unlockLayer(id), [layerManager]);
  const toggleLocked = useCallback((id) => layerManager.toggleLocked(id), [layerManager]);
  const canEdit = useCallback((id) => layerManager.canEdit(id), [layerManager]);

  return {
    layers,
    layerManager,
    showLayer,
    hideLayer,
    toggleVisible,
    lockLayer,
    unlockLayer,
    toggleLocked,
    canEdit,
  };
}

/**
 * Hook reativo para elementos do plano.
 */
export function usePlanElements() {
  const { planDocument } = usePlanContext();

  const elements = useSyncExternalStore(
    (onStoreChange) => planDocument.subscribe(onStoreChange),
    () => planDocument.getElementsInRenderOrder(),
    () => planDocument.getElementsInRenderOrder()
  );

  return {
    elements,
    planDocument,
    addElement: (el) => planDocument.addElement(el),
    updateElement: (id, patch) => planDocument.updateElement(id, patch),
    removeElement: (id) => planDocument.removeElement(id),
    getByLayer: (layerId) => planDocument.getElementsByLayer(layerId),
  };
}
