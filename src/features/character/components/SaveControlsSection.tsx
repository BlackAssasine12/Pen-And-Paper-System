import { SaveControls, generateStandardFilename, getSaveData, loadCharacterFile, saveCharacterData } from "..";
import type { MagicSystemState } from "../../magic/types";
import { useCharacter } from "../CharacterContext";
import type { CharacterData } from "../../../types/character";

type SaveControlsSectionProps = {
  magicState: MagicSystemState;
  onMagicChange: (state: MagicSystemState) => void;
  onCharacterLoaded?: (data: CharacterData) => void;
};

const SaveControlsSection = ({ magicState, onMagicChange, onCharacterLoaded }: SaveControlsSectionProps) => {
  const { name, experience, setLevel, setName, setXp, setSteigerungspunkte } = useCharacter();

  return (
    <SaveControls
      characterName={name}
      onGenerateFilename={generateStandardFilename}
      onLoadFile={(file) =>
        loadCharacterFile(file, {
          onMagicLoaded: onMagicChange,
          onCharacterLoaded: (data) => {
            if (data.charakter?.charakterInfo?.name) {
              setName(data.charakter.charakterInfo.name);
            }
            onCharacterLoaded?.(data);
          },
          onExperienceLoaded: (loadedExperience) => {
            setLevel(loadedExperience.level ?? 0);
            setXp(loadedExperience.xp ?? 0);
            setSteigerungspunkte(loadedExperience.steigerungspunkte ?? 0);
          },
        })
      }
      onSave={(filename) => {
        const data = getSaveData();
        if (!data) {
          alert("Es wurden noch keine Charakterdaten geladen!");
          return;
        }

        saveCharacterData(data, {
          filename,
          characterName: name,
          experience,
          magicSystem: {
            ...magicState,
            advancementPoints: experience.steigerungspunkte,
          },
        });
      }}
    />
  );
};

export default SaveControlsSection;
