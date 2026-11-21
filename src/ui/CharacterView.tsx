import type { ReactNode } from "react";
import {
  attributeIds,
  classGroups,
  getAdvancementCost,
  modifierIds,
  raceGroups,
} from "../domain";
import type {
  AdvancementTarget,
  CharacterAction,
  CharacterProfile,
  CharacterState,
  DerivedValues,
  ModifierId,
  Talent,
} from "../domain";
import { NumberField, StatList } from "./fields";

export type PlayCharacterProps = {
  character: CharacterState;
  derived: DerivedValues;
  onAction: (action: CharacterAction) => boolean;
};

const profileFields: ReadonlyArray<readonly [keyof CharacterProfile, string]> = [
  ["name", "Name"],
  ["titel", "Titel"],
  ["alter", "Alter"],
  ["geschlecht", "Geschlecht"],
  ["größe", "Größe"],
  ["gewicht", "Gewicht"],
  ["haarfarbe", "Haarfarbe"],
  ["augenfarbe", "Augenfarbe"],
];

const modifierLabels: Record<ModifierId, string> = {
  magie: "Magie",
  asp: "Astralpunkte",
  lp: "Lebenspunkte",
  fernkampf: "Fernkampf",
  nahkampf: "Nahkampf",
  gift: "Giftresistenz",
  stealth: "Tarnung",
};

const talentGroups: Record<Talent["group"], string> = {
  Assassinen_Talente: "Assassinen-Talente",
  Talente_1: "Talente 1",
  Talente_2: "Talente 2",
  Handwerkstalente: "Handwerkstalente",
  Wissenschaftliche_Talente: "Wissenschaftliche Talente",
  Normale_Talente: "Normale Talente",
};

const sheetSections = [
  ["sheet-profile", "Profil"],
  ["sheet-attributes", "Attribute"],
  ["sheet-combat", "Kampf"],
  ["sheet-talents", "Talente"],
  ["sheet-hidden", "Ausgeblendete"],
];

function SheetPanel({ id, title, children, className = "" }: {
  id: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`panel ${className}`} aria-labelledby={id}>
      <h3 id={id} tabIndex={-1}>{title}</h3>
      {children}
    </section>
  );
}

function Profile({ character, onAction }: Pick<PlayCharacterProps, "character" | "onAction">) {
  const profile = character.profile;

  function selectGroup(key: "rasse" | "klasse", label: string, groups: Readonly<Record<string, readonly string[]>>) {
    const existing = profile[key];
    const isCustom = existing && !Object.values(groups).some((items) => items.includes(existing));
    return (
      <label className="field">
        <span>{label}</span>
        <select value={existing} onChange={(event) => onAction({ type: "set-profile", key, value: event.target.value })}>
          <option value="">Bitte wählen</option>
          {isCustom && <option value={existing}>{existing}</option>}
          {Object.entries(groups).map(([group, items]) => (
            <optgroup label={group} key={group}>
              {items.map((item) => <option value={item} key={item}>{item}</option>)}
            </optgroup>
          ))}
        </select>
      </label>
    );
  }

  return (
    <SheetPanel id="sheet-profile" title="Profil">
      <div className="form-grid">
        {profileFields.map(([key, label]) => (
          <label className="field" key={key}>
            <span>{label}</span>
            <input value={profile[key]} onChange={(event) => onAction({ type: "set-profile", key, value: event.target.value })} />
          </label>
        ))}
        {selectGroup("rasse", "Rasse", raceGroups)}
        {selectGroup("klasse", "Klasse", classGroups)}
      </div>
    </SheetPanel>
  );
}

function AdvanceField({ target, label, value, sheet, signed, steps }: {
  target: AdvancementTarget;
  label: string;
  value: number;
  sheet: PlayCharacterProps;
  signed?: boolean;
  steps?: boolean;
}) {
  const { character, derived, onAction } = sheet;
  const limits = target.kind === "combatTalent" ? derived.limits.talent : derived.limits[target.kind];
  return (
    <NumberField
      label={label}
      value={value}
      signed={signed}
      steps={steps}
      bounds={limits}
      getCost={(next) => getAdvancementCost(character, target, next)}
      onCommit={(next) => onAction({ type: "advance", target, value: next })}
    />
  );
}

function TalentList(sheet: PlayCharacterProps) {
  const { character, onAction } = sheet;
  return (
    <SheetPanel className="panel--wide" id="sheet-talents" title="Talente">
      {Object.entries(talentGroups).map(([group, label]) => {
        const talents = character.talents.filter((talent) => talent.group === group && !character.hidden.talents.includes(talent.id));
        if (!talents.length) return null;
        return (
          <details key={group}>
            <summary>{label}</summary>
            <div className="item-grid">
              {talents.map((talent) => (
                <div className="list-row list-row--edit" key={talent.id}>
                  <div className="form-stack form-stack--compact">
                    <AdvanceField target={{ kind: "talent", id: talent.id }} label={talent.name} value={talent.value} sheet={sheet} signed />
                    {talent.attributes && <small className="muted">{talent.attributes}</small>}
                  </div>
                  <button type="button" className="button button--quiet" aria-label={`${talent.name} ausblenden`} onClick={() => onAction({ type: "hide-talent", id: talent.id })}>
                    Ausblenden
                  </button>
                </div>
              ))}
            </div>
          </details>
        );
      })}
      {character.talents.every((talent) => character.hidden.talents.includes(talent.id)) &&
        <p className="muted">Hier sind keine sichtbaren Talente.</p>}
    </SheetPanel>
  );
}

function Combat(sheet: PlayCharacterProps) {
  const { character, derived, onAction } = sheet;
  return (
    <SheetPanel className="panel--wide" id="sheet-combat" title="Kampf">
      <StatList entries={[
        ["Attacke-Basiswert", derived.attacke],
        ["Parade-Basiswert", derived.parade],
        ["Wurfwaffen-Basiswert", derived.wurf],
        ["Schusswaffen-Basiswert", derived.schuss],
      ]} />
      {character.combatTalents.length > 0 && (
        <>
          <div className="button-row">
            <button type="button" className="button" onClick={() => onAction({ type: "auto-distribute" })}>
              Kampftalente automatisch umrechnen
            </button>
          </div>
          <details>
            <summary>Kampftalente</summary>
            <div className="item-grid">
              {character.combatTalents.map((talent) => (
                <article className="combat-card" key={talent.id}>
                  <h4>{talent.name}</h4>
                  <div className="combat-values">
                    <NumberField label="AT" value={talent.attack} signed steps={false}
                      onCommit={(value) => onAction({ type: "set-combat", id: talent.id, field: "attack", value })} />
                    <NumberField label="PA" value={talent.parry} signed steps={false}
                      onCommit={(value) => onAction({ type: "set-combat", id: talent.id, field: "parry", value })} />
                    <AdvanceField label="Skillwert" value={talent.value} target={{ kind: "combatTalent", id: talent.id }} sheet={sheet} signed steps={false} />
                  </div>
                </article>
              ))}
            </div>
          </details>
        </>
      )}
    </SheetPanel>
  );
}

function HiddenFields(sheet: PlayCharacterProps) {
  const { character, onAction } = sheet;
  const hiddenTalents = character.talents.filter((talent) => character.hidden.talents.includes(talent.id));
  return (
    <SheetPanel className="panel--wide" id="sheet-hidden" title="Ausgeblendete Werte">
      {character.hidden.attributes.length + hiddenTalents.length === 0 && <p className="muted">Alle Werte sind sichtbar.</p>}
      <div className="item-grid">
        {character.hidden.attributes.map((id) => (
          <div className="list-row list-row--edit" key={id}>
            <AdvanceField label={id} value={character.attributes[id]} target={{ kind: "attribute", id }} sheet={sheet} />
            <button type="button" className="button" aria-label={`${id} einblenden`} onClick={() => onAction({ type: "restore-attribute", id })}>
              Einblenden
            </button>
          </div>
        ))}
        {hiddenTalents.map(({ id, name, value }) => (
          <div className="list-row list-row--edit" key={id}>
            <AdvanceField label={name} value={value} target={{ kind: "talent", id }} sheet={sheet} signed />
            <button type="button" className="button" aria-label={`${name} einblenden`} onClick={() => onAction({ type: "restore-talent", id })}>
              Einblenden
            </button>
          </div>
        ))}
      </div>
    </SheetPanel>
  );
}

const resourceFields = [
  ["lp", "Aktuelle Lebenspunkte"],
  ["endurance", "Aktuelle Ausdauer"],
  ["asp", "Aktuelle Astralenergie"],
] as const;

export function CharacterView(sheet: PlayCharacterProps) {
  const { character, derived, onAction } = sheet;

  return (
    <section className="play-view" aria-labelledby="sheet-heading">
      <h2 id="sheet-heading">Charakterbogen</h2>
      <nav className="sheet-nav" aria-label="Bereiche des Charakterbogens">
        {sheetSections.map(([id, label]) => (
          <button type="button" key={id} onClick={() => {
            const heading = document.getElementById(id);
            heading?.focus({ preventScroll: true });
            heading?.scrollIntoView({ block: "start" });
          }}>
            {label}
          </button>
        ))}
      </nav>

      <div className="play-grid">
        <SheetPanel id="sheet-progress" title="Fortschritt">
          <StatList entries={[
            ["Level", derived.level],
            ["Verfügbare Steigerungspunkte", derived.availablePoints],
            ["Gesteigerte", character.experience.spent],
          ]} />
          <NumberField label="Erfahrungspunkte (XP)" value={character.experience.xp} bounds={{ min: 0 }} step={100}
            onCommit={(value) => onAction({ type: "set-xp", value })} />
          {character.freeAdvancement && <p className="feedback">Kostenloses Steigern ist aktiv.</p>}
        </SheetPanel>
        <Profile character={character} onAction={onAction} />

        <SheetPanel className="panel--wide" id="sheet-resources" title="Sonderwerte">
          <StatList entries={[
            ["Maximale Lebenspunkte", derived.lpMax],
            ["Maximale Ausdauer", derived.ausdauerMax],
            ["Maximale Astralenergie", derived.maxAstralenergie],
            ["Magiebegabung", derived.magiebegabung],
            ["Magieresistenz", derived.magieresistenz],
            ["Giftresistenz", derived.giftresistenz],
            ["Schnelligkeit", derived.schnelligkeit],
          ]} />
          <div className="form-grid">
            {resourceFields.map(([key, label]) => (
              <NumberField key={key} label={label} value={character.resources[key]} signed
                onCommit={(value) => onAction({ type: "set-resource", key, value })} />
            ))}
          </div>
        </SheetPanel>

        <Combat {...sheet} />

        <SheetPanel id="sheet-attributes" title="Attribute">
          <div>
            {attributeIds.filter((id) => !character.hidden.attributes.includes(id)).map((id) => (
              <div className="list-row list-row--edit" key={id}>
                <AdvanceField label={id} value={character.attributes[id]} target={{ kind: "attribute", id }} sheet={sheet} />
                <button type="button" className="button button--quiet" aria-label={`${id} ausblenden`} onClick={() => onAction({ type: "hide-attribute", id })}>
                  Ausblenden
                </button>
              </div>
            ))}
          </div>
          {character.hidden.attributes.length === attributeIds.length && <p className="muted">Alle Attribute sind ausgeblendet.</p>}
        </SheetPanel>

        <SheetPanel id="sheet-modifiers" title="Modifikatoren">
          <div className="form-grid">
            {modifierIds.map((id) => (
              <AdvanceField key={id} label={modifierLabels[id]} value={character.modifiers[id]} target={{ kind: "modifier", id }} sheet={sheet} />
            ))}
          </div>
        </SheetPanel>
        <TalentList {...sheet} />
        <HiddenFields {...sheet} />
      </div>
    </section>
  );
}
