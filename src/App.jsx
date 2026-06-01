import { Routes, Route, Navigate } from 'react-router-dom';
import ElectronBanner from './components/ElectronBanner';
import HomePage from './pages/HomePage';
import NewPlanPage from './pages/NewPlanPage';
import SettingsPage from './pages/SettingsPage';
import MapLibraryPage from './pages/MapLibraryPage';

/**
 * Roteamento principal.
 * FUTURE: rotas para replay, multiplayer lobby e editor de esquadrões.
 */
export default function App() {
  return (
    <>
    <ElectronBanner />
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/plano" element={<NewPlanPage />} />
      <Route path="/biblioteca" element={<MapLibraryPage />} />
      <Route path="/configuracoes" element={<SettingsPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
    </>
  );
}
