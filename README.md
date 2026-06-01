# TW Commander

Aplicativo desktop profissional para **Windows** voltado a líderes de guilda do jogo **Perfect World**, com foco em planejamento estratégico de **Territory War (TW)** usando mapas interativos.

**Versão atual:** MVP 0.1 (offline)

---

## Funcionalidades (MVP)

- Tela inicial com navegação
- Novo plano com visualizador de mapas
- Carregamento automático de imagens na pasta `maps/`
- Importação de mapas via seletor do Windows
- Zoom com scroll do mouse
- Arrastar mapa com botão esquerdo
- Centralização automática ao abrir
- Limites de pan para evitar perder o mapa
- Biblioteca e configurações (placeholders)

---

## Tecnologias

| Camada | Tecnologia |
|--------|------------|
| Frontend | React + Vite |
| Desktop | Electron |
| Canvas | Konva.js (react-konva) |
| Linguagem | JavaScript |
| Empacotamento | Electron Builder |

**Sistema alvo:** Windows 10 e Windows 11

---

## Requisitos

- [Node.js](https://nodejs.org/) 18 ou superior
- npm 9+
- Windows 10/11 (para build do instalador)

---

## Instalação

```bash
git clone <url-do-repositorio>
cd TW-PW
npm install
```

---

## Executar em desenvolvimento

```bash
npm run dev
```

Isso inicia o Vite (`http://localhost:5173`) e o Electron em paralelo.

### Mapas em desenvolvimento

Coloque imagens em:

```
/maps
```

Formatos suportados: **PNG**, **JPG**, **JPEG**, **WEBP**

---

## Compilar instalador

```bash
npm run build
```

O instalador será gerado em:

```
/release/TWCommanderSetup.exe
```

> **Windows:** se o build falhar com erro de *symbolic link* ao extrair `winCodeSign`, execute o terminal como **Administrador** ou ative o [Modo de Desenvolvedor](https://learn.microsoft.com/pt-br/windows/apps/get-started/enable-your-device-for-development) nas Configurações do Windows. O projeto já desativa assinatura de código (`signAndEditExecutable: false`) para builds locais.

---

## Scripts disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm install` | Instala dependências |
| `npm run dev` | Modo desenvolvimento (Vite + Electron) |
| `npm run build` | Build web + instalador Windows |
| `npm run build:web` | Apenas build do frontend |
| `npm run preview` | Preview do Vite (sem Electron) |

---

## Estrutura do projeto

```
TW-PW/
├── electron/
│   ├── main.js          # Processo principal Electron + IPC
│   └── preload.js       # Ponte segura para o renderer
├── maps/                # Mapas locais (auto-carregados)
├── public/
├── src/
│   ├── components/      # UI e MapViewer (Konva)
│   ├── hooks/           # useMaps
│   ├── layouts/         # EditorLayout
│   ├── pages/           # Telas da aplicação
│   ├── services/        # mapService (IPC)
│   ├── styles/          # Tema global
│   └── future/          # Documentação de arquitetura futura
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

---

## Identidade visual

| Elemento | Cor |
|----------|-----|
| Fundo | `#151515` |
| Painéis | `#1F1F1F` |
| Dourado | `#D4AF37` |
| Marrom | `#5A3E2B` |
| Texto | `#FFFFFF` |
| Destaques | `#F4D03F` |

---

## Uso rápido

1. Abra o TW Commander
2. Clique em **Novo Plano**
3. Selecione um mapa na barra lateral ou **Importar Mapa**
4. Use o **scroll** para zoom e **arraste** com o botão esquerdo para mover
5. Use **Centralizar mapa** no painel Zoom para reajustar a visualização

---

## Performance

O visualizador utiliza Konva.js com otimizações (`perfectDrawEnabled: false`, cache de imagem) para suportar mapas de até **8000×8000** pixels com fluidez adequada em hardware moderno.

---

## Próximas etapas

- [ ] Esquadrões arrastáveis no mapa
- [ ] Objetivos, setas e marcadores
- [ ] Salvamento de estratégias (`.twplan`)
- [ ] Timeline e replay
- [ ] Multiplayer (Socket.IO)
- [ ] Banco de dados local
- [ ] Sistema de licenciamento
- [ ] IA e simulações

Consulte `src/future/ARCHITECTURE.md` para o mapa de integração dos módulos.

---

## Licença

MIT
