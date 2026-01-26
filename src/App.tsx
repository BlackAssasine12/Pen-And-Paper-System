import TopControls from "./components/TopControls";
import Tabs from "./components/Tabs";

const App = () => {
  return (
    <div className="app">
      <header className="app__header">
        <h1>Pen &amp; Paper System Dokumentation</h1>
        <p>
          Erste Schritte der Vite/React-Überführung: Struktur, Tabs und SCSS-Styles laufen
          bereits in der neuen Oberfläche.
        </p>
      </header>
      <main className="app__content">
        <TopControls />
        <Tabs />
      </main>
    </div>
  );
};

export default App;
