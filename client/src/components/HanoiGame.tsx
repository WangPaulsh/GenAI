import { useEffect } from 'react';
import GameCanvas from './GameCanvas';
import GameUI from './GameUI';
import { useHanoi } from '../lib/stores/useHanoi';
import { useAudio } from '../lib/stores/useAudio';
import '../styles/hanoi.css';

export default function HanoiGame() {
  const { initializeGame } = useHanoi();
  const { setHitSound, setSuccessSound } = useAudio();

  useEffect(() => {
    // Initialize the game with 3 disks by default
    initializeGame(3);

    // Load audio files
    const hitAudio = new Audio('/sounds/hit.mp3');
    const successAudio = new Audio('/sounds/success.mp3');
    
    setHitSound(hitAudio);
    setSuccessSound(successAudio);
  }, [initializeGame, setHitSound, setSuccessSound]);

  return (
    <div className="hanoi-game">
      <GameUI />
      <GameCanvas />
    </div>
  );
}
