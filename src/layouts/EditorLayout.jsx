import TopMenuBar from '../components/TopMenuBar';
import './EditorLayout.css';

export default function EditorLayout({ sidebar, children, onBack }) {
  return (
    <div className="editor-layout">
      <TopMenuBar onBack={onBack} />
      <div className="editor-layout__body">
        {sidebar}
        <main className="editor-layout__main">{children}</main>
      </div>
    </div>
  );
}
