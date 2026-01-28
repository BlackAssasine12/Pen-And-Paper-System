import { useEffect, useState } from "react";

type SaveControlsProps = {
  onSave: (filename: string) => void;
  onLoadFile: (file: File) => void;
  onGenerateFilename: (characterName: string) => string;
  characterName: string;
};

const SaveControls = ({ onSave, onLoadFile, onGenerateFilename, characterName }: SaveControlsProps) => {
  const [filename, setFilename] = useState("");
  const baseUrl = import.meta.env.BASE_URL ?? "/";

  useEffect(() => {
    if (!filename.trim()) {
      setFilename(onGenerateFilename(characterName));
    }
  }, [characterName, filename, onGenerateFilename]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setFilename(file.name);
      onLoadFile(file);
      event.target.value = "";
    }
  };

  const handleGenerateFilename = () => {
    const nextFilename = onGenerateFilename(characterName);
    setFilename(nextFilename);
  };

  const handleFilenameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFilename(event.target.value);
  };

  const handleSave = () => {
    const resolvedFilename = filename.trim() || onGenerateFilename(characterName);
    onSave(resolvedFilename);
  };

  return (
    <div id="FileReaderInOutput">
      <div className="file-upload-container">
        <input type="file" onChange={handleFileChange} />
        <button type="button" id="saveButton" onClick={handleSave}>
          Speichern
        </button>
        <a href={`${baseUrl}charbogen/charakter.json`} download="charakter.json">
          Neue JSON-Datei herunterladen
        </a>
        <label htmlFor="filenameInput">Dateiname:</label>
        <input
          type="text"
          id="filenameInput"
          placeholder="Dateiname (automatisch mit Datum)"
          value={filename}
          onChange={handleFilenameChange}
        />
        <button type="button" id="generateFilenameButton" onClick={handleGenerateFilename}>
          Standard-Name
        </button>
      </div>
    </div>
  );
};

export default SaveControls;
