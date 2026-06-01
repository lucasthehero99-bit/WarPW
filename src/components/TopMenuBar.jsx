import './TopMenuBar.css';

const MENU_ITEMS = ['Arquivo', 'Editar', 'Visualizar', 'Ajuda'];

/**
 * Barra de menu superior (placeholders).
 * FUTURE: atalhos, undo/redo, exportação de estratégia e replay.
 */
export default function TopMenuBar({ onBack }) {
  return (
    <header className="top-menu-bar">
      <div className="top-menu-bar__left">
        {onBack && (
          <button type="button" className="top-menu-bar__back" onClick={onBack}>
            ← Início
          </button>
        )}
        <nav className="top-menu-bar__nav" aria-label="Menu principal">
          {MENU_ITEMS.map((item) => (
            <button key={item} type="button" className="top-menu-bar__item">
              {item}
            </button>
          ))}
        </nav>
      </div>
      <div className="top-menu-bar__brand">TW Commander</div>
    </header>
  );
}
