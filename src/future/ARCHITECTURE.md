# Arquitetura — TW Commander

## Sistema de Camadas (implementado)

| Ordem | ID | Nome | Conteúdo futuro |
|-------|-----|------|-----------------|
| 1 | `map` | Mapa | Imagem TW (base, bloqueada) |
| 2 | `objectives` | Objetivos | Torres, cristais, bases |
| 3 | `squads` | Esquadrões | Grupos ataque/defesa arrastáveis |
| 4 | `tactical-arrows` | Setas Táticas | Rotas, avanços, recuos |
| 5 | `texts` | Textos | Observações e comandos |
| 6 | `markings` | Marcações | Círculos, retângulos, destaques |

### Módulos centrais

| Arquivo | Responsabilidade |
|---------|------------------|
| `src/layers/LayerManager.js` | visível, bloqueada, ordem, snapshots |
| `src/layers/PlanDocument.js` | elementos com `layerId` obrigatório |
| `src/context/PlanContext.jsx` | instâncias por sessão de edição |
| `src/components/canvas/MapCanvas.jsx` | renderização ordenada por camada |
| `src/components/layers/LayerPanel.jsx` | UI ocultar / bloquear |

### Regras

- Todo elemento **deve** ter `layerId` registrado no `LayerManager`.
- Renderização segue `order` (z-index) de baixo para cima.
- `canEdit(layerId)` = visível && !bloqueada.
- Camada `map` permanece bloqueada (fundo não editável).

### Multiplayer (futuro)

- `src/services/syncService.js` — replicar eventos `LAYER_EVENTS` e `PLAN_EVENTS`.

### Replay (futuro)

- `src/services/replayService.js` — gravar `getSnapshot()` de LayerManager + PlanDocument.

## Electron

| Recurso | Local |
|---------|-------|
| Banco local SQLite | `electron/main.js` |
| Licenciamento | `electron/main.js` |
| Socket.IO | processo auxiliar + `syncService` |

## Persistência (futuro)

- Arquivo `.twplan`: `{ layers: LayerManager.getSnapshot(), plan: PlanDocument.getSnapshot() }`
