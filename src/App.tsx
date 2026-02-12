import Tabs from "./components/Tabs";
import { CharacterProvider } from "./features/character";
import { ShopProvider } from "./features/shop";

const App = () => {
  return (
    <CharacterProvider>
      <ShopProvider>
        <div className="app">
          <Tabs />
        </div>
      </ShopProvider>
    </CharacterProvider>
  );
};

export default App;
