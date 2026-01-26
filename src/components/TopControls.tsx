const TopControls = () => {
  return (
    <section className="top-controls" aria-label="Schnellaktionen">
      <label className="toggleLabel">
        <input type="checkbox" id="toggleListenersCheckbox" />
        Kostenloses Steigern
      </label>
      <label className="toggleLabel">
        <input type="checkbox" id="toggleHiddenCheckbox" />
        Ausgeblendeten Item Container Anzeigen
      </label>
      <button type="button" id="ASkillVert">
        Automatische Umrechnung
      </button>
    </section>
  );
};

export default TopControls;
