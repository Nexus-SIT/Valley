import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { mapGrid, TILE_SIZE, MAP_COLS, MAP_ROWS, TILE_COLORS, SPAWN_X, SPAWN_Y } from '../game/mapData';

const GameCanvas = ({ onNexusInteract }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reqRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Initialize engine
    engineRef.current = new GameEngine(SPAWN_X, SPAWN_Y, onNexusInteract);

    // Event listeners
    window.addEventListener('keydown', engineRef.current.handleKeyDown);
    window.addEventListener('keyup', engineRef.current.handleKeyUp);

    // Game loop
    const loop = () => {
      // Update state
      engineRef.current.update();

      // Render
      render(ctx, engineRef.current.player);

      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', engineRef.current.handleKeyDown);
      window.removeEventListener('keyup', engineRef.current.handleKeyUp);
      cancelAnimationFrame(reqRef.current);
    };
  }, [onNexusInteract]);

  const render = (ctx, player) => {
    // Clear canvas
    ctx.clearRect(0, 0, MAP_COLS * TILE_SIZE, MAP_ROWS * TILE_SIZE);

    // Draw Map
    for (let row = 0; row < MAP_ROWS; row++) {
      for (let col = 0; col < MAP_COLS; col++) {
        const tileType = mapGrid[row][col];
        ctx.fillStyle = TILE_COLORS[tileType];
        ctx.fillRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
        
        // Add subtle grid line for retro feel
        ctx.strokeStyle = 'rgba(0,0,0,0.1)';
        ctx.strokeRect(col * TILE_SIZE, row * TILE_SIZE, TILE_SIZE, TILE_SIZE);
      }
    }

    // Draw "Nexus" text on the blue building
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    ctx.font = '16px monospace';
    ctx.textAlign = 'center';
    ctx.fillText('NEXUS', 12.5 * TILE_SIZE, 3 * TILE_SIZE);
    
    // Draw Door placeholder
    ctx.fillStyle = '#111';
    ctx.fillRect(12 * TILE_SIZE, 3 * TILE_SIZE + 10, TILE_SIZE, TILE_SIZE - 10);

    // Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player details (eyes)
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 4, player.y + 4, 4, 4);
    ctx.fillRect(player.x + 16, player.y + 4, 4, 4);

    // Draw Instructions Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
    ctx.fillRect(10, 10, 220, 60);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('WASD/Arrows to move', 20, 30);
    ctx.fillText('Go to Nexus & Press SPACE', 20, 50);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={MAP_COLS * TILE_SIZE}
        height={MAP_ROWS * TILE_SIZE}
        style={{
          border: '4px solid #333',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          imageRendering: 'pixelated', // crisp pixel look
        }}
      />
    </div>
  );
};

export default GameCanvas;
