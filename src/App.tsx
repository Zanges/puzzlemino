import { GameLayout } from './components/game/GameLayout';
import { MainMenu } from './components/game/MainMenu';
import { useGameStore } from './store/gameStore';

function App() {
  const appState = useGameStore(state => state.appState);

  return (
    <>
      {appState === 'menu' ? <MainMenu /> : <GameLayout />}
    </>
  )
}

export default App
