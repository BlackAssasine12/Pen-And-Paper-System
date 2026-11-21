import { CharacterView } from "./CharacterView";
import type { PlayCharacterProps } from "./CharacterView";
import { InventoryView } from "./InventoryView";
import { MagicView } from "./MagicView";
import { SettingsView } from "./SettingsView";
import type { AppearanceProps } from "./SettingsView";
import { ToolsView } from "./ToolsView";

export type PlayViewId = "bogen" | "magie" | "inventar" | "werkzeuge" | "einstellungen";
export type { Appearance } from "./SettingsView";

type PlayViewProps = PlayCharacterProps & AppearanceProps & {
  view: PlayViewId;
  onMagicImport?: () => void;
  onMagicExport?: () => void;
};

export default function PlayView({ view, appearance, onAppearanceChange, onMagicImport, onMagicExport, ...sheet }: PlayViewProps) {
  return (
    <>
      <div hidden={view !== "bogen"}><CharacterView {...sheet} /></div>
      <div hidden={view !== "magie"}><MagicView {...sheet} onMagicImport={onMagicImport} onMagicExport={onMagicExport} /></div>
      <div hidden={view !== "inventar"}><InventoryView {...sheet} /></div>
      <div hidden={view !== "werkzeuge"}><ToolsView /></div>
      <div hidden={view !== "einstellungen"}><SettingsView {...sheet} appearance={appearance} onAppearanceChange={onAppearanceChange} /></div>
    </>
  );
}
