import { useCharacter } from "./CharacterContext";

const CharacterNameInput = () => {
  const { name, setName } = useCharacter();

  return (
    <div className="mediumFlexItem">
      Name:{" "}
      <input
        className="eingabefeld"
        value={name}
        onChange={(event) => setName(event.target.value)}
        id="name"
        type="text"
      />
    </div>
  );
};

export default CharacterNameInput;
