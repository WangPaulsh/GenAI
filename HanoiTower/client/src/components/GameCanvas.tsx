import { useRef, useEffect, useCallback } from 'react';
import { useHanoi } from '../lib/stores/useHanoi';
import { useAudio } from '../lib/stores/useAudio';

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 500;
const POLE_HEIGHT = 300;
const POLE_WIDTH = 10;
const BASE_WIDTH = 200;
const BASE_HEIGHT = 20;
const DISK_HEIGHT = 30;
const MIN_DISK_WIDTH = 60;
const MAX_DISK_WIDTH = 180;

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { poles, selectedDisk, selectDisk, moveDisk, isValidMove, totalDisks } = useHanoi();
  const { playHit, playSuccess } = useAudio();

  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw poles and bases
    for (let i = 0; i < 3; i++) {
      const x = (CANVAS_WIDTH / 4) * (i + 1);
      
      // Draw base
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x - BASE_WIDTH / 2, CANVAS_HEIGHT - 100, BASE_WIDTH, BASE_HEIGHT);
      
      // Draw pole
      ctx.fillStyle = '#654321';
      ctx.fillRect(x - POLE_WIDTH / 2, CANVAS_HEIGHT - 100 - POLE_HEIGHT, POLE_WIDTH, POLE_HEIGHT);
    }

    // Draw disks
    for (let poleIndex = 0; poleIndex < 3; poleIndex++) {
      const poleX = (CANVAS_WIDTH / 4) * (poleIndex + 1);
      const disks = poles[poleIndex];
      
      disks.forEach((diskSize, diskIndex) => {
        const diskWidth = MIN_DISK_WIDTH + ((MAX_DISK_WIDTH - MIN_DISK_WIDTH) * (diskSize - 1)) / (totalDisks - 1);
        const y = CANVAS_HEIGHT - 100 - BASE_HEIGHT - (diskIndex + 1) * DISK_HEIGHT;
        
        // Determine color based on disk size
        const hue = (diskSize - 1) * (360 / totalDisks);
        const isSelected = selectedDisk?.pole === poleIndex && selectedDisk?.diskIndex === disks.length - 1;
        
        ctx.fillStyle = isSelected ? '#ffff00' : `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(poleX - diskWidth / 2, y, diskWidth, DISK_HEIGHT);
        
        // Add border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.strokeRect(poleX - diskWidth / 2, y, diskWidth, DISK_HEIGHT);
        
        // Add disk number text
        ctx.fillStyle = '#000';
        ctx.font = '16px Inter';
        ctx.textAlign = 'center';
        ctx.fillText(diskSize.toString(), poleX, y + DISK_HEIGHT / 2 + 6);
      });
    }

    // Draw pole labels
    ctx.fillStyle = '#ffffff';
    ctx.font = '20px Inter';
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const x = (CANVAS_WIDTH / 4) * (i + 1);
      const labels = ['Left', 'Center', 'Right'];
      ctx.fillText(labels[i], x, CANVAS_HEIGHT - 20);
    }
  }, [poles, selectedDisk, totalDisks]);

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    // Determine which pole was clicked
    let clickedPole = -1;
    for (let i = 0; i < 3; i++) {
      const poleX = (CANVAS_WIDTH / 4) * (i + 1);
      if (Math.abs(x - poleX) < BASE_WIDTH / 2) {
        clickedPole = i;
        break;
      }
    }

    if (clickedPole === -1) return;

    if (selectedDisk === null) {
      // Select top disk from clicked pole
      if (poles[clickedPole].length > 0) {
        selectDisk(clickedPole, poles[clickedPole].length - 1);
        playHit();
      }
    } else {
      // Try to move selected disk to clicked pole
      if (selectedDisk.pole === clickedPole) {
        // Clicking the same pole deselects
        selectDisk(null, -1);
      } else if (isValidMove(selectedDisk.pole, clickedPole)) {
        moveDisk(selectedDisk.pole, clickedPole);
        playSuccess();
      } else {
        // Invalid move
        playHit();
      }
    }
  }, [poles, selectedDisk, selectDisk, moveDisk, isValidMove, playHit, playSuccess]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    drawGame(ctx);
  }, [drawGame]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.addEventListener('click', handleCanvasClick);
    return () => canvas.removeEventListener('click', handleCanvasClick);
  }, [handleCanvasClick]);

  return (
    <div className="canvas-container">
      <canvas
        ref={canvasRef}
        width={CANVAS_WIDTH}
        height={CANVAS_HEIGHT}
        className="game-canvas"
      />
    </div>
  );
}
