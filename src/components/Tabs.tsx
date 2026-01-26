import { useState } from "react";

type TabKey = "charakter" | "magie" | "ausgeblendete" | "inventar" | "werkzeuge" | "einstellungen";

type TabDefinition = {
  key: TabKey;
  label: string;
};

const tabs: TabDefinition[] = [
  { key: "charakter", label: "Charakter" },
  { key: "magie", label: "Magie" },
  { key: "ausgeblendete", label: "Ausgeblendete" },
  { key: "inventar", label: "Inventar & Shop" },
  { key: "werkzeuge", label: "Werkzeuge" },
  { key: "einstellungen", label: "Einstellungen" },
];

const Tabs = () => {
  const [activeTab, setActiveTab] = useState<TabKey>("charakter");

  return (
    <section className="tabs" aria-label="Charakterbogen Bereiche">
      <nav className="tabs__nav" aria-label="Reiter Navigation">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            className={`tabs__button${activeTab === tab.key ? " is-active" : ""}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </nav>
      <div className="tabs__panel" role="tabpanel">
        {activeTab === "charakter" && (
          <div className="panel">
            <h2>Charakter</h2>
            <p>
              Startpunkt für die React-Überführung des Charakterbogens. Die Eingabefelder,
              Werteblöcke und Berechnungen werden als Komponenten aufgebaut.
            </p>
            <div className="panel__grid">
              <div className="panel__card">
                <h3>Dateiverwaltung</h3>
                <p>Import/Export des Charakter-JSON wird hier vorbereitet.</p>
              </div>
              <div className="panel__card">
                <h3>Charakterwerte</h3>
                <p>Attribute, Sonderwerte und Erfahrungswerte werden modularisiert.</p>
              </div>
              <div className="panel__card">
                <h3>Kampf & Talente</h3>
                <p>Angriff, Parade und Talente wandern in eigene Unterbereiche.</p>
              </div>
            </div>
          </div>
        )}
        {activeTab === "magie" && (
          <div className="panel">
            <h2>Magie</h2>
            <p>Magiesystem-Tab als nächster Schritt für die TSX-Komponenten.</p>
          </div>
        )}
        {activeTab === "ausgeblendete" && (
          <div className="panel">
            <h2>Ausgeblendete</h2>
            <p>Container für ausgeblendete Items und Statusmeldungen.</p>
          </div>
        )}
        {activeTab === "inventar" && (
          <div className="panel">
            <h2>Inventar & Shop</h2>
            <p>Inventarlisten, Shopdaten und Filterlogik folgen als React-State.</p>
          </div>
        )}
        {activeTab === "werkzeuge" && (
          <div className="panel">
            <h2>Werkzeuge</h2>
            <p>Würfel, Rechner und Hilfstools werden als Widgets umgesetzt.</p>
          </div>
        )}
        {activeTab === "einstellungen" && (
          <div className="panel">
            <h2>Einstellungen</h2>
            <p>Layouts, Schriftarten und globale Einstellungen landen hier.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Tabs;
