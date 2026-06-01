# Arquitetura Futura — TW Commander

Este documento descreve onde cada módulo será integrado nas próximas versões.

## Canvas (Konva) — `src/components/MapViewer.jsx`

| Recurso | Implementação planejada |
|---------|-------------------------|
| Esquadrões arrastáveis | Nova `Layer` com `Konva.Group` por unidade |
| Objetivos | Marcadores com ícones e labels |
| Setas | `Konva.Arrow` na layer `annotations` |
| Marcadores | `Konva.Label` + formas customizadas |

## Estado do plano — `src/pages/NewPlanPage.jsx`

- Store central (Context ou Zustand) para entidades do plano
- Serialização para arquivo `.twplan`
- Undo/redo via histórico de comandos

## Electron — `electron/main.js`

| Recurso | Local |
|---------|-------|
| Banco local SQLite | Inicialização em `app.whenReady()` |
| Licenciamento | Validação antes de `createWindow()` |
| Socket.IO | Processo auxiliar ou integrado ao main |

## Serviços — `src/services/`

- `mapService.js` — cache e metadados de mapas
- `planService.js` (futuro) — CRUD de estratégias
- `syncService.js` (futuro) — multiplayer
- `replayService.js` (futuro) — timeline e playback

## UI

- `Sidebar.jsx` — ferramentas de esquadrões e timeline
- `TopMenuBar.jsx` — exportação, importação, replay
- `SettingsPage.jsx` — tema, idioma, updates, licença
