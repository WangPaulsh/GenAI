import { useRef, useEffect, useCallback, useState } from 'react';
import { useHanoi } from '../lib/stores/useHanoi';
import { useAudio } from '../lib/stores/useAudio';

// Base ratios for responsive scaling
const ASPECT_RATIO = 1.6; // width/height ratio
const POLE_HEIGHT_RATIO = 0.6; // relative to canvas height
const POLE_WIDTH_RATIO = 0.0125; // relative to canvas width
const BASE_WIDTH_RATIO = 0.25; // relative to canvas width
const BASE_HEIGHT_RATIO = 0.04; // relative to canvas height
const DISK_HEIGHT_RATIO = 0.06; // relative to canvas height
const MIN_DISK_WIDTH_RATIO = 0.075; // relative to canvas width
const MAX_DISK_WIDTH_RATIO = 0.225; // relative to canvas width

export default function GameCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { poles, selectedDisk, selectDisk, moveDisk, isValidMove, totalDisks } = useHanoi();
  const { playHit, playSuccess } = useAudio();
  
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 500 });
  
  // Calculate responsive dimensions
  const getDimensions = useCallback((canvasWidth: number, canvasHeight: number) => {
    return {
      CANVAS_WIDTH: canvasWidth,
      CANVAS_HEIGHT: canvasHeight,
      POLE_HEIGHT: canvasHeight * POLE_HEIGHT_RATIO,
      POLE_WIDTH: canvasWidth * POLE_WIDTH_RATIO,
      BASE_WIDTH: canvasWidth * BASE_WIDTH_RATIO,
      BASE_HEIGHT: canvasHeight * BASE_HEIGHT_RATIO,
      DISK_HEIGHT: canvasHeight * DISK_HEIGHT_RATIO,
      MIN_DISK_WIDTH: canvasWidth * MIN_DISK_WIDTH_RATIO,
      MAX_DISK_WIDTH: canvasWidth * MAX_DISK_WIDTH_RATIO
    };
  }, []);

  const drawGame = useCallback((ctx: CanvasRenderingContext2D) => {
    const dims = getDimensions(canvasSize.width, canvasSize.height);
    
    // Clear canvas
    ctx.fillStyle = '#0f0f23';
    ctx.fillRect(0, 0, dims.CANVAS_WIDTH, dims.CANVAS_HEIGHT);

    const bottomMargin = dims.CANVAS_HEIGHT * 0.2;

    // Draw poles and bases
    for (let i = 0; i < 3; i++) {
      const x = (dims.CANVAS_WIDTH / 4) * (i + 1);
      
      // Draw base
      ctx.fillStyle = '#8b4513';
      ctx.fillRect(x - dims.BASE_WIDTH / 2, dims.CANVAS_HEIGHT - bottomMargin, dims.BASE_WIDTH, dims.BASE_HEIGHT);
      
      // Draw pole
      ctx.fillStyle = '#654321';
      ctx.fillRect(x - dims.POLE_WIDTH / 2, dims.CANVAS_HEIGHT - bottomMargin - dims.POLE_HEIGHT, dims.POLE_WIDTH, dims.POLE_HEIGHT);
    }

    // Draw disks
    for (let poleIndex = 0; poleIndex < 3; poleIndex++) {
      const poleX = (dims.CANVAS_WIDTH / 4) * (poleIndex + 1);
      const disks = poles[poleIndex];
      
      disks.forEach((diskSize, diskIndex) => {
        const diskWidth = dims.MIN_DISK_WIDTH + ((dims.MAX_DISK_WIDTH - dims.MIN_DISK_WIDTH) * (diskSize - 1)) / (totalDisks - 1);
        const y = dims.CANVAS_HEIGHT - bottomMargin - dims.BASE_HEIGHT - (diskIndex + 1) * dims.DISK_HEIGHT;
        
        // Determine color based on disk size
        const hue = (diskSize - 1) * (360 / totalDisks);
        const isSelected = selectedDisk?.pole === poleIndex && selectedDisk?.diskIndex === disks.length - 1;
        
        ctx.fillStyle = isSelected ? '#ffff00' : `hsl(${hue}, 70%, 50%)`;
        ctx.fillRect(poleX - diskWidth / 2, y, diskWidth, dims.DISK_HEIGHT);
        
        // Add border
        ctx.strokeStyle = '#333';
        ctx.lineWidth = Math.max(1, dims.CANVAS_WIDTH * 0.0025);
        ctx.strokeRect(poleX - diskWidth / 2, y, diskWidth, dims.DISK_HEIGHT);
        
        // Add disk number text
        ctx.fillStyle = '#000';
        ctx.font = `${Math.max(12, dims.CANVAS_HEIGHT * 0.032)}px Inter`;
        ctx.textAlign = 'center';
        ctx.fillText(diskSize.toString(), poleX, y + dims.DISK_HEIGHT / 2 + dims.CANVAS_HEIGHT * 0.012);
      });
    }

    // Draw pole labels
    ctx.fillStyle = '#ffffff';
    ctx.font = `${Math.max(14, dims.CANVAS_HEIGHT * 0.04)}px Inter`;
    ctx.textAlign = 'center';
    for (let i = 0; i < 3; i++) {
      const x = (dims.CANVAS_WIDTH / 4) * (i + 1);
      const labels = ['Left', 'Center', 'Right'];
      ctx.fillText(labels[i], x, dims.CANVAS_HEIGHT - dims.CANVAS_HEIGHT * 0.04);
    }
  }, [poles, selectedDisk, totalDisks, canvasSize, getDimensions]);

  const handleCanvasClick = useCallback((event: MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = (event.clientX - rect.left) * (canvasSize.width / rect.width);
    const y = (event.clientY - rect.top) * (canvasSize.height / rect.height);
    
    const dims = getDimensions(canvasSize.width, canvasSize.height);

    // Determine which pole was clicked
    let clickedPole = -1;
    for (let i = 0; i < 3; i++) {
      const poleX = (dims.CANVAS_WIDTH / 4) * (i + 1);
      if (Math.abs(x - poleX) < dims.BASE_WIDTH / 2) {
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
  }, [poles, selectedDisk, selectDisk, moveDisk, isValidMove, playHit, playSuccess, canvasSize, getDimensions]);

  // Update canvas size based on container
  const updateCanvasSize = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;
    
    const containerRect = container.getBoundingClientRect();
    const availableWidth = containerRect.width - 40; // padding
    const availableHeight = containerRect.height - 40; // padding
    
    let newWidth = availableWidth;
    let newHeight = newWidth / ASPECT_RATIO;
    
    if (newHeight > availableHeight) {
      newHeight = availableHeight;
      newWidth = newHeight * ASPECT_RATIO;
    }
    
    // Ensure minimum size
    newWidth = Math.max(400, Math.min(1200, newWidth));
    newHeight = Math.max(250, Math.min(750, newHeight));
    
    setCanvasSize({ width: newWidth, height: newHeight });
  }, []);
  
  useEffect(() => {
    updateCanvasSize();
    
    const handleResize = () => {
      setTimeout(updateCanvasSize, 100); // Debounce
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [updateCanvasSize]);

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
    <div ref={containerRef} className="canvas-container">
      <canvas
        ref={canvasRef}
        width={canvasSize.width}
        height={canvasSize.height}
        style={{ width: canvasSize.width, height: canvasSize.height }}
        className="game-canvas"
      />
    </div>
  );
}
