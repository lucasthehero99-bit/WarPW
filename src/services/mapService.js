/**
 * Serviço de mapas — abstração para Electron IPC.
 * FUTURE: cache local em IndexedDB / SQLite para mapas e metadados.
 */

const SUPPORTED_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.webp'];

export function isElectron() {
  return typeof window !== 'undefined' && window.twCommander?.isElectron === true;
}

export async function listMaps() {
  if (!isElectron()) {
    return { mapsDir: null, maps: [] };
  }
  return window.twCommander.maps.list();
}

export async function readMap(filePath) {
  if (!isElectron()) {
    throw new Error('Leitura de mapas disponível apenas no aplicativo desktop.');
  }
  const result = await window.twCommander.maps.read(filePath);
  return {
    fileName: result.fileName,
    mimeType: result.mimeType,
    url: result.url,
  };
}

export async function importMap() {
  if (!isElectron()) {
    return { canceled: true };
  }
  return window.twCommander.maps.import();
}

export async function openMapsFolder() {
  if (!isElectron()) {
    return null;
  }
  return window.twCommander.maps.openFolder();
}

export { SUPPORTED_EXTENSIONS };
