const TopControls = () => {
  return (
    <section className="top-controls" aria-label="Schnellaktionen">
      <label className="toggle-label">
        <input type="checkbox" name="kostenloses-steigern" />
        Kostenloses Steigern
      </label>
      <label className="toggle-label">
        <input type="checkbox" name="hidden-container" />
        Ausgeblendeten Item-Container anzeigen
      </label>
      <button type="button" className="ghost-button">
        Automatische Umrechnung
      </button>
    </section>
  );
};

export default TopControls;
