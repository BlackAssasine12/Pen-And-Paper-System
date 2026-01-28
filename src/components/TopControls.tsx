type TopControlsProps = {
  listenersEnabled: boolean;
  onToggleListeners: (enabled: boolean) => void;
  hiddenItemsVisible: boolean;
  onToggleHiddenItems: (visible: boolean) => void;
  onAutoSkill: () => void;
};

const TopControls = ({
  listenersEnabled,
  onToggleListeners,
  hiddenItemsVisible,
  onToggleHiddenItems,
  onAutoSkill,
}: TopControlsProps) => {
  return (
    <section className="top-controls" aria-label="Schnellaktionen">
      <label className="toggleLabel">
        <input
          type="checkbox"
          id="toggleListenersCheckbox"
          checked={!listenersEnabled}
          onChange={(event) => onToggleListeners(!event.target.checked)}
        />
        Kostenloses Steigern
      </label>
      <label className="toggleLabel">
        <input
          type="checkbox"
          id="toggleHiddenCheckbox"
          checked={hiddenItemsVisible}
          onChange={(event) => onToggleHiddenItems(event.target.checked)}
        />
        Ausgeblendeten Item Container Anzeigen
      </label>
      <button type="button" id="ASkillVert" onClick={onAutoSkill}>
        Automatische Umrechnung
      </button>
    </section>
  );
};

export default TopControls;
