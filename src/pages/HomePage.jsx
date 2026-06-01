import { useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();

  const handleOpenStrategy = () => {
    // FUTURE: diálogo para abrir arquivo de estratégia salvo (.twplan)
    navigate('/plano');
  };

  return (
    <div className="home-page">
      <div className="home-page__overlay" />
      <div className="home-page__content">
        <header className="home-page__header">
          <div className="home-page__emblem" aria-hidden="true">
            ⚔
          </div>
          <h1 className="home-page__title">TW COMMANDER</h1>
          <p className="home-page__subtitle">
            Planejamento Estratégico para Territory Wars
          </p>
        </header>

        <nav className="home-page__actions" aria-label="Ações principais">
          <Button variant="primary" onClick={() => navigate('/plano')}>
            Novo Plano
          </Button>
          <Button variant="primary" onClick={handleOpenStrategy}>
            Abrir Estratégia
          </Button>
          <Button variant="secondary" onClick={() => navigate('/biblioteca')}>
            Biblioteca de Mapas
          </Button>
          <Button variant="secondary" onClick={() => navigate('/configuracoes')}>
            Configurações
          </Button>
        </nav>

        <footer className="home-page__footer">Versão MVP 0.1</footer>
      </div>
    </div>
  );
}
