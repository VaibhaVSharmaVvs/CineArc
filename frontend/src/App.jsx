import useGame from './hooks/useGame';
import Background from './components/Background';
import LoadingOverlay from './components/LoadingOverlay';
import ErrorToast from './components/ErrorToast';
import SetupForm from './components/SetupForm';
import GameBoard from './components/GameBoard';
import GameOver from './components/GameOver';

export default function App() {
  const { state, setConfig, start, guess, goToSetup, clearError } = useGame();

  return (
    <>
      <Background />

      {state.loading && <LoadingOverlay message={state.loadingMsg} />}
      <ErrorToast message={state.error} onClose={clearError} />

      {state.view === 'setup' && (
        <SetupForm config={state} setConfig={setConfig} onStart={start} />
      )}

      {state.view === 'game' && (
        <GameBoard state={state} onGuess={guess} onBack={goToSetup} />
      )}

      {state.view === 'gameover' && (
        <GameOver state={state} onPlayAgain={goToSetup} />
      )}
    </>
  );
}
