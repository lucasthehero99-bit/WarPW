import { createContext, useContext, useMemo, useRef } from 'react';
import { LayerManager, PlanDocument } from '../layers';

const PlanContext = createContext(null);

/**
 * Provedor do plano ativo (LayerManager + PlanDocument).
 * Escopo: tela de edição / Novo Plano.
 */
export function PlanProvider({ children }) {
  const instancesRef = useRef(null);

  if (!instancesRef.current) {
    const layerManager = new LayerManager();
    const planDocument = new PlanDocument(layerManager);
    instancesRef.current = { layerManager, planDocument };
  }

  const value = useMemo(
    () => instancesRef.current,
    []
  );

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

export function usePlanContext() {
  const context = useContext(PlanContext);
  if (!context) {
    throw new Error('usePlanContext deve ser usado dentro de <PlanProvider>.');
  }
  return context;
}
