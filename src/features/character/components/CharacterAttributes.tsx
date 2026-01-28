import React, { useEffect, useRef } from "react";

type TalentEntry = {
    Name: string;
    Attribute: string;
    Wert: number;
};

type CharakterData = {
    charakter?: {
        fähigkeiten?: {
            Assassinen_Talente?: TalentEntry[];
            Talente_1?: TalentEntry[];
            Talente_2?: TalentEntry[];
            Handwerkstalente?: TalentEntry[];
            Kampf_Talente?: Record<string, number[]>;
            modifier?: Record<string, number>;
            sonderwerte?: Record<string, number>;
            attribute?: Record<string, number>;
        };
        Magische_Elemente?: Record<string, number>;
    };
};

type Props = {
    data: CharakterData;
    // optional: externe Funktionen aus deinem Projekt
    saveChanges?: (data: CharakterData) => void;
    addInputChangeListeners?: () => void;
};

export const applyMaxValueSettings = (level: number, MB: number) => {
    const talentInputs = document.querySelectorAll<HTMLInputElement>(
        ".Assassinen_Talente, .Talente_1, .Talente_2, .Handwerkstalente, .Kampf_Talente"
    );

    talentInputs.forEach((input) => {
        input.max = String(Math.min(level + 10, 21));
        input.min = String(-3);
    });

    const attrInputs = document.querySelectorAll<HTMLInputElement>(".attribute");
    attrInputs.forEach((input) => {
        input.max = String(Math.min(level + 12, 21));
        input.min = String(7);
    });

    const magicInputs = document.querySelectorAll<HTMLInputElement>(".Magische_Elemente");
    magicInputs.forEach((input) => {
        input.max = String(Math.min(MB / 2, 21));
        input.min = String(0);
    });

    const modifierInputs = document.querySelectorAll<HTMLInputElement>(".modifier");
    modifierInputs.forEach((input) => {
        input.max = String(level + 2);
        input.min = String(0);
    });

    const xp = document.querySelector<HTMLInputElement>("#erfahrung_xp");
    if (xp) xp.step = "100";
};

export default function CharacterAttributes({
    data,
    saveChanges,
    addInputChangeListeners,
}: Props) {
    const charakterContainerRef = useRef<HTMLDivElement | null>(null);

    // ---------- helpers ----------
    const createSection = (
        title: string,
        attributes: TalentEntry[] | undefined,
        sectionId: string
    ): JSX.Element => {
        return (
            <div className="FlexItemContainer" data-section={sectionId}>
                <h6>{title}</h6>

                {Array.isArray(attributes) && (
                    <div className={`${sectionId.toLowerCase()}-flex`}>
                        {attributes.map((attribute, idx) => {
                            if (!attribute) return null;

                            const sanitizedName = String(attribute.Name ?? "").replace(/\s+/g, "_");
                            const attributeString = `${attribute.Name} (${attribute.Attribute}): `;

                            return (
                                <div className="FlexItem" key={`${sectionId}_${sanitizedName}_${idx}`}>
                                    <label>{attributeString}</label>
                                    <input
                                        className={`stg attributeInput ${sectionId}`}
                                        type="number"
                                        defaultValue={attribute.Wert}
                                        id={`${sectionId}_${sanitizedName}`}
                                    />
                                    <button className="hidebutton" type="button">
                                        X
                                    </button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        );
    };

    const fillExistingContainer = (
        container: HTMLElement | null,
        attributes: Record<string, number> | undefined,
        sectionId: string
    ) => {
        if (!container || !attributes) return;

        // Titel sichern
        const title = container.querySelector("h6");
        container.innerHTML = "";
        if (title) container.appendChild(title);

        const flexContainer = document.createElement("div");
        flexContainer.classList.add(`${sectionId}-flex`);

        for (const key in attributes) {
            const sanitizedKey = key.replace(/\s+/g, "_");

            const flexItem = document.createElement("div");
            flexItem.classList.add("FlexItem");
            flexItem.id = `${sectionId}_${sanitizedKey}_Tooltip`;

            const label = document.createElement("label");
            label.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}: `;

            const input = document.createElement("input");
            input.className = `stg attributeInput ${sectionId} ${sectionId}_${sanitizedKey}`;
            input.type = "number";
            input.value = String(attributes[key]);
            input.id = `${sectionId}_${sanitizedKey}`;

            const btn = document.createElement("button");
            btn.className = "hidebutton";
            btn.type = "button";
            btn.textContent = "X";

            flexItem.appendChild(label);
            flexItem.appendChild(input);
            flexItem.appendChild(btn);

            flexContainer.appendChild(flexItem);
        }

        container.appendChild(flexContainer);
    };

    const addToolTip = () => {
        const ids = [
            "Magische_Elemente_Schatten_Tooltip",
            "Magische_Elemente_Licht_Tooltip",
            "Magische_Elemente_Holz_Tooltip",
            "Magische_Elemente_Metall_Tooltip",
            "Magische_Elemente_Eis_Tooltip",
            "Magische_Elemente_Leben_Tooltip",
            "Magische_Elemente_Nekromantie_Tooltip",
            "Magische_Elemente_Blitz_Tooltip",
            "Magische_Elemente_Gravitation_Tooltip",
            "Magische_Elemente_Erschaffung_Tooltip",
            "Magische_Elemente_Raumzeit_Tooltip",
            "Magische_Elemente_Gift_Tooltip",
            "Magische_Elemente_Blut_Tooltip",
        ];

        const tooltips = [
            "Benötigt: Luft Dunkle",
            "Benötigt: Helle Feuer",
            "Benötigt: Erde Wasser",
            "Benötigt: Erde Feuer",
            "Benötigt: Luft Wasser",
            "Benötigt: Heilung Natur",
            "Benötigt: Dunkle Leben",
            "Benötigt: Licht Luft",
            "Benötigt: Erde Luft",
            "Benötigt: Feuer Wasser Erde Luft Natur Dunkle Helle",
            "Benötigt: Alle Elemente",
            "Benötigt: Natur Wasser",
            "Benötigt: Leben Wasser",
        ];

        ids.forEach((id, index) => {
            const element = document.getElementById(id);
            if (element) element.title = tooltips[index];
        });
    };

    // ---------- render via React + patch existing DOM containers ----------
    useEffect(() => {
        const charakter = data?.charakter;
        const faehigkeiten = charakter?.fähigkeiten;

        // bereits vorhandene Container im DOM (aus deinem bestehenden HTML)
        const modifierContainer = document.getElementById("modifierContainer");
        const sonderwerteContainer = document.getElementById("sonderwerteContainer");
        const attributeContainer = document.getElementById("attributeContainer");
        const magieContainer = document.getElementById("magischeElementeContainer");

        fillExistingContainer(modifierContainer, faehigkeiten?.modifier, "modifier");
        fillExistingContainer(sonderwerteContainer, faehigkeiten?.sonderwerte, "sonderwerte");
        fillExistingContainer(attributeContainer, faehigkeiten?.attribute, "attribute");
        fillExistingContainer(magieContainer, charakter?.Magische_Elemente, "Magische_Elemente");

        // Kampf-Talente im existierenden Grid
        const kampfTalenteGridContainer = document.getElementById("kampfTalenteGridContainer");
        const kampfTalente = faehigkeiten?.Kampf_Talente;

        if (kampfTalenteGridContainer && kampfTalente) {
            kampfTalenteGridContainer.innerHTML = "";

            for (const key in kampfTalente) {
                const values = kampfTalente[key];
                if (!Array.isArray(values)) continue;

                const sanitizedKey = key.replace(/\s+/g, "_");

                const wrapper = document.createElement("div");
                wrapper.classList.add("BigFlexItem", "ArrayContainer");

                const label = document.createElement("label");
                label.textContent = `${key.charAt(0).toUpperCase() + key.slice(1)}:`;
                wrapper.appendChild(label);

                values.forEach((value, index) => {
                    const input = document.createElement("input");
                    input.className = `stg ArrAttributeInput Kampf_Talente Kampf_Talente_${index}`;
                    input.type = "number";
                    input.value = String(value);
                    input.id = `Kampf_Talente_${sanitizedKey}_${index}`;
                    wrapper.appendChild(input);
                });

                kampfTalenteGridContainer.appendChild(wrapper);
            }
        }

        addInputChangeListeners?.();
        addToolTip();

        // MaxValue NICHT automatisch aufrufen, weil du level/MB woanders herziehst.
        // MaxValue(level, MB);

        // Save-Button Hook (falls du weiterhin globalen Button nutzt)
        const saveBtn = document.getElementById("saveButton");
        const handler = () => saveChanges?.(data);
        if (saveBtn && saveChanges) saveBtn.addEventListener("click", handler);

        return () => {
            if (saveBtn && saveChanges) saveBtn.removeEventListener("click", handler);
        };
    }, [data, saveChanges, addInputChangeListeners]);

    const charakter = data?.charakter;
    const faehigkeiten = charakter?.fähigkeiten;

    return (
        <div ref={charakterContainerRef} id="charakterContainer">
            <div className="attributeFlexContainer">
                {createSection(
                    "Assassinen Talente",
                    faehigkeiten?.Assassinen_Talente,
                    "Assassinen_Talente"
                )}
                {createSection("Talente 1", faehigkeiten?.Talente_1, "Talente_1")}
                {createSection("Talente 2", faehigkeiten?.Talente_2, "Talente_2")}
                {createSection(
                    "Handwerkstalente",
                    faehigkeiten?.Handwerkstalente,
                    "Handwerkstalente"
                )}
            </div>
        </div>
    );
}
