import path from 'path';
import { existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { app } from 'electron';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** Pasta maps ao lado do código-fonte (sempre correta em desenvolvimento). */
export const DEV_MAPS_DIR = path.join(__dirname, '..', 'maps');

/**
 * Diretório gravável para importações.
 * - Dev: pasta /maps do projeto
 * - Instalado: AppData do usuário (mapas copiados na instalação vão para resources)
 */
export function getWritableMapsDirectory(isDev) {
  if (isDev) {
    return DEV_MAPS_DIR;
  }
  return path.join(app.getPath('userData'), 'maps');
}

/**
 * Pastas somente leitura extras para listar mapas (instalador).
 */
export function getReadOnlyMapsDirectories(isDev) {
  if (isDev) {
    return [];
  }

  const dirs = [];
  const bundled = path.join(process.resourcesPath, 'maps');
  if (existsSync(bundled)) {
    dirs.push(bundled);
  }

  const portable = path.join(path.dirname(app.getPath('exe')), 'maps');
  if (existsSync(portable) && portable !== bundled) {
    dirs.push(portable);
  }

  return dirs;
}

/**
 * Verifica se o arquivo está dentro do diretório permitido (Windows: sem diferenciar maiúsculas).
 */
export function isPathInsideDirectory(filePath, directory) {
  const resolvedFile = path.resolve(filePath);
  const resolvedDir = path.resolve(directory);
  const relative = path.relative(resolvedDir, resolvedFile);

  if (relative === '' || relative === '.') {
    return true;
  }

  return !(relative.startsWith('..') || path.isAbsolute(relative));
}

export function isPathInAllowedMapsRoots(filePath, allowedRoots) {
  return allowedRoots.some((dir) => isPathInsideDirectory(filePath, dir));
}
