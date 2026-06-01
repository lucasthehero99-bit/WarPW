import { isElectron } from '../services/mapService';
import './ElectronBanner.css';

export default function ElectronBanner() {
  if (isElectron()) {
    return null;
  }

  return (
    <div className="electron-banner" role="alert">
      <strong>Modo navegador detectado.</strong> Mapas e importação só funcionam no app
      Electron. Na pasta do projeto, execute: <code>npm run dev</code>
    </div>
  );
}
