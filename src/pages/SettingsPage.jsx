import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './SettingsPage.css';

const PLACEHOLDER_SETTINGS = [
  { id: 'theme', label: 'Tema', description: 'Personalização visual do aplicativo' },
  { id: 'language', label: 'Idioma', description: 'Português, English (em breve)' },
  { id: 'updates', label: 'Atualizações', description: 'Verificação automática de novas versões' },
  { id: 'license', label: 'Licença', description: 'Ativação e gerenciamento de licença' },
];

/**
 * Configurações — placeholders para versões futuras.
 * FUTURE: persistência em arquivo de configuração / registro Windows.
 * FUTURE: integração com sistema de licenciamento online/offline.
 */
export default function SettingsPage() {
  const navigate = useNavigate();

  return (
    <div className="settings-page">
      <header className="settings-page__header">
        <Button variant="ghost" onClick={() => navigate('/')}>
          ← Voltar
        </Button>
        <h1>Configurações</h1>
      </header>

      <ul className="settings-page__list">
        {PLACEHOLDER_SETTINGS.map((item) => (
          <li key={item.id} className="settings-item settings-item--disabled">
            <div className="settings-item__info">
              <span className="settings-item__label">{item.label}</span>
              <span className="settings-item__desc">{item.description}</span>
            </div>
            <span className="settings-item__badge">Em breve</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
