import { useHanoi } from '../lib/stores/useHanoi';
import { useAudio } from '../lib/stores/useAudio';

export default function GameUI() {
  const { 
    moves, 
    isComplete, 
    totalDisks, 
    initializeGame, 
    resetGame,
    getOptimalMoves 
  } = useHanoi();
  const { toggleMute, isMuted } = useAudio();

  const handleDiskCountChange = (count: number) => {
    initializeGame(count);
  };

  return (
    <div className="game-ui">
      <div className="ui-header">
        <h1>Tower of Hanoi</h1>
        <div className="controls">
          <button onClick={toggleMute} className="mute-button">
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="game-info">
        <div className="disk-selector">
          <label>Number of Disks:</label>
          <div className="disk-buttons">
            {[3, 4, 5, 6, 7, 8].map(count => (
              <button
                key={count}
                onClick={() => handleDiskCountChange(count)}
                className={totalDisks === count ? 'active' : ''}
              >
                {count}
              </button>
            ))}
          </div>
        </div>

        <div className="game-stats">
          <div className="stat">
            <span className="label">Moves:</span>
            <span className="value">{moves}</span>
          </div>
          <div className="stat">
            <span className="label">Optimal:</span>
            <span className="value">{getOptimalMoves()}</span>
          </div>
          <div className="stat">
            <span className="label">Efficiency:</span>
            <span className="value">
              {moves > 0 ? Math.round((getOptimalMoves() / moves) * 100) : 100}%
            </span>
          </div>
        </div>

        <div className="game-actions">
          <button onClick={resetGame} className="reset-button">
            Reset Game
          </button>
        </div>
      </div>

      {isComplete && (
        <div className="win-message">
          <h2>🎉 Congratulations! 🎉</h2>
          <p>You solved the puzzle in {moves} moves!</p>
          <p>Optimal solution: {getOptimalMoves()} moves</p>
        </div>
      )}

      <div className="instructions">
        <h3>How to Play:</h3>
        <ul>
          <li>Click on a pole to select the top disk</li>
          <li>Click on another pole to move the disk there</li>
          <li>Large disks cannot be placed on smaller disks</li>
          <li>Move all disks from the left pole to the right pole</li>
        </ul>
      </div>
    </div>
  );
}
