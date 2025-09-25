import { Suspense, useEffect, useState } from "react";
import "@fontsource/inter";
import HanoiGame from "./components/HanoiGame";

// Main App component
function App() {
  const [showGame, setShowGame] = useState(false);

  // Show the game once everything is loaded
  useEffect(() => {
    setShowGame(true);
  }, []);

  return (
    <div style={{ width: '100vw', height: '100vh', position: 'relative', overflow: 'hidden', backgroundColor: '#1a1a2e' }}>
      {showGame && (
        <Suspense fallback={<div className="flex items-center justify-center h-full text-white">Loading...</div>}>
          <HanoiGame />
        </Suspense>
      )}
    </div>
  );
}

export default App;
