import { applyCharacterAction } from "./actions";
import { calculateAvailablePoints } from "./calculations";
import { createCharacter } from "./catalogs";
import type { AttributeId } from "./types";

export const starterFocuses = {
  kampf: { label: "Kampf", attributes: ["Konstitution", "Körperkraft"], talent: "Körperbeherrschung" },
  wissen: { label: "Magie und Wissen", attributes: ["Klugheit", "Intuition"], talent: "Magiekunde" },
  gesellschaft: { label: "Gesellschaft", attributes: ["Charisma", "Intuition"], talent: "Überreden" },
} as const satisfies Record<string, { label: string; attributes: readonly AttributeId[]; talent: string }>;

export type StarterFocus = keyof typeof starterFocuses;

export function suggestStarter(klasse: string, focus: StarterFocus) {
  const initial = createCharacter();
  let character = { ...initial, profile: { ...initial.profile, klasse } };
  const template = starterFocuses[focus];

  for (const id of template.attributes) {
    const applied = applyCharacterAction(character, {
      type: "advance", target: { kind: "attribute", id }, value: initial.attributes[id] + 1,
    });
    if (applied.error) return undefined;
    character = applied.state;
  }

  const talent = initial.talents.find(({ name }) => name === template.talent);
  if (!talent) return undefined;
  const applied = applyCharacterAction(character, {
    type: "advance", target: { kind: "talent", id: talent.id }, value: talent.value + 2,
  });
  if (applied.error) return undefined;

  return {
    character: applied.state,
    pointsSpent: applied.state.experience.spent,
    pointsLeft: calculateAvailablePoints(applied.state.experience),
    changes: [...template.attributes.map((id) => id + " +1"), template.talent + " +2"],
  };
}
