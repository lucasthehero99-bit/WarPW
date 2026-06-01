import { app, BrowserWindow, ipcMain, dialog, shell } from 'electron';
import path from 'path';
import fs from 'fs/promises';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import {
  DEV_MAPS_DIR,
  getWritableMapsDirectory,
  getReadOnlyMapsDirectories,
  isPathInAllowedMapsRoots,
} from './mapsPath.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPPORTED_EXTENSIONS = new Set(['.png', '.jpg', '.jpeg', '.webp']);
const isDev = !app.isPackaged;

/** @type {BrowserWindow | null} */
let mainWindow = null;

/** @type {string[]} */
let allowedMapRoots = [];

/**
 * FUTURE: Sistema de licenciamento — validar chave antes de abrir janela principal.
 * FUTURE: Banco de dados local (SQLite) — inicializar conexão em app.whenReady().
 */

async function seedMapsFromBundle(targetDir) {
  const bundledMaps = path.join(process.resourcesPath, 'maps');
  if (!existsSync(bundledMaps)) return;

  const entries = await fs.readdir(bundledMaps, { withFileTypes: true });
  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const dest = path.join(targetDir, entry.name);
    if (!existsSync(dest)) {
      await fs.copyFile(path.join(bundledMaps, entry.name), dest);
    }
  }
}

async function ensureMapsDirectory() {
  const mapsDir = getWritableMapsDirectory(isDev);
  if (!existsSync(mapsDir)) {
    await fs.mkdir(mapsDir, { recursive: true });
  }
  if (!isDev) {
    await seedMapsFromBundle(mapsDir);
  }
  return mapsDir;
}

function refreshAllowedRoots(writableDir) {
  const roots = [path.resolve(writableDir)];
  for (const dir of getReadOnlyMapsDirectories(isDev)) {
    const resolved = path.resolve(dir);
    if (!roots.includes(resolved)) {
      roots.push(resolved);
    }
  }
  if (isDev) {
    const resolvedDev = path.resolve(DEV_MAPS_DIR);
    if (!roots.includes(resolvedDev)) {
      roots.push(resolvedDev);
    }
  }
  allowedMapRoots = roots;
  return roots;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'TW Commander',
    backgroundColor: '#151515',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false,
    },
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow?.show();
  });

  if (isDev) {
    mainWindow.loadURL('http://localhost:5173');
  } else {
    mainWindow.loadFile(path.join(app.getAppPath(), 'dist', 'index.html'));
  }

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

async function collectMapsFromDirectory(mapsDir, mapsById) {
  if (!existsSync(mapsDir)) return;

  const entries = await fs.readdir(mapsDir, { withFileTypes: true });

  for (const entry of entries) {
    if (!entry.isFile()) continue;
    const ext = path.extname(entry.name).toLowerCase();
    if (!SUPPORTED_EXTENSIONS.has(ext)) continue;

    const fullPath = path.join(mapsDir, entry.name);
    const stat = await fs.stat(fullPath);

    if (!mapsById.has(entry.name)) {
      mapsById.set(entry.name, {
        id: entry.name,
        name: path.basename(entry.name, ext),
        fileName: entry.name,
        path: fullPath,
        size: stat.size,
        modifiedAt: stat.mtimeMs,
      });
    }
  }
}

async function listMapFiles() {
  const writableDir = await ensureMapsDirectory();
  refreshAllowedRoots(writableDir);

  const mapsById = new Map();

  for (const dir of allowedMapRoots) {
    await collectMapsFromDirectory(dir, mapsById);
  }

  const maps = Array.from(mapsById.values());
  maps.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));

  return { mapsDir: writableDir, maps, allowedRoots: allowedMapRoots };
}

function registerIpcHandlers() {
  ipcMain.handle('maps:list', async () => {
    const { mapsDir, maps, allowedRoots } = await listMapFiles();
    return { mapsDir, maps, allowedRoots };
  });

  ipcMain.handle('maps:read', async (_event, filePath) => {
    if (!allowedMapRoots.length) {
      await listMapFiles();
    }

    const resolved = path.resolve(filePath);

    if (!isPathInAllowedMapsRoots(resolved, allowedMapRoots)) {
      throw new Error('Acesso negado ao arquivo de mapa.');
    }

    if (!existsSync(resolved)) {
      throw new Error('Arquivo de mapa não encontrado.');
    }

    const ext = path.extname(resolved).toLowerCase();
    const mimeTypes = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.webp': 'image/webp',
    };
    const mimeType = mimeTypes[ext] || 'application/octet-stream';
    const buffer = await fs.readFile(resolved);

    // Data URL funciona em dev (http://localhost) e no build (file://).
    // URLs file:// são bloqueadas pelo Chromium quando a UI vem do Vite.
    return {
      fileName: path.basename(resolved),
      mimeType,
      url: `data:${mimeType};base64,${buffer.toString('base64')}`,
    };
  });

  ipcMain.handle('maps:import', async () => {
    try {
      const parentWindow = mainWindow ?? BrowserWindow.getFocusedWindow();

      const result = await dialog.showOpenDialog(parentWindow ?? undefined, {
        title: 'Importar Mapa',
        properties: ['openFile'],
        filters: [
          {
            name: 'Imagens de Mapa',
            extensions: ['png', 'jpg', 'jpeg', 'webp'],
          },
        ],
      });

      if (result.canceled || result.filePaths.length === 0) {
        return { canceled: true };
      }

      const sourcePath = result.filePaths[0];
      const mapsDir = await ensureMapsDirectory();
      const fileName = path.basename(sourcePath);
      const destPath = path.join(mapsDir, fileName);

      let finalPath = destPath;
      if (existsSync(destPath)) {
        const { name, ext } = path.parse(fileName);
        const stamp = Date.now();
        finalPath = path.join(mapsDir, `${name}_${stamp}${ext}`);
      }

      await fs.copyFile(sourcePath, finalPath);

      const { maps } = await listMapFiles();
      const imported = maps.find((m) => path.resolve(m.path) === path.resolve(finalPath));

      return {
        canceled: false,
        map: imported ?? {
          id: path.basename(finalPath),
          name: path.basename(finalPath, path.extname(finalPath)),
          fileName: path.basename(finalPath),
          path: finalPath,
        },
      };
    } catch (err) {
      return {
        canceled: true,
        error: err.message || 'Falha ao importar mapa.',
      };
    }
  });

  ipcMain.handle('maps:open-folder', async () => {
    const mapsDir = await ensureMapsDirectory();
    await shell.openPath(mapsDir);
    return mapsDir;
  });

  /**
   * FUTURE: Multiplayer Socket.IO — canal IPC para estado de sala e sincronização.
   * FUTURE: Replay / Timeline — persistir e carregar sessões de planejamento.
   */
}

app.whenReady().then(async () => {
  await ensureMapsDirectory();
  registerIpcHandlers();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
