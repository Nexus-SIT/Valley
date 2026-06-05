import React, { useEffect, useRef } from 'react';
import { GameEngine } from '../game/engine';
import { REGIONS, MAP_WIDTH, MAP_HEIGHT, SPAWN_X, SPAWN_Y, NEXUS_DOOR_BOX } from '../game/mapData';

const VIEWPORT_W = 800;
const VIEWPORT_H = 600;

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
      engineRef.current.update();
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
    // Calculate Camera Position (centered on player)
    let camX = player.x + player.width / 2 - VIEWPORT_W / 2;
    let camY = player.y + player.height / 2 - VIEWPORT_H / 2;

    // Clamp camera to map boundaries
    camX = Math.max(0, Math.min(camX, MAP_WIDTH - VIEWPORT_W));
    camY = Math.max(0, Math.min(camY, MAP_HEIGHT - VIEWPORT_H));

    // Clear and fill base (just in case)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    ctx.save();
    // Translate the context by the camera offset
    ctx.translate(-camX, -camY);

    // 1. Draw Regions
    for (let region of REGIONS) {
      // Basic culling: don't draw if outside viewport
      if (
        region.x + region.w < camX ||
        region.x > camX + VIEWPORT_W ||
        region.y + region.h < camY ||
        region.y > camY + VIEWPORT_H
      ) {
        continue; // skip
      }

      ctx.fillStyle = region.color;
      ctx.fillRect(region.x, region.y, region.w, region.h);

      // Add a subtle border/texture for solid objects to make them pop
      if (region.solid && region.type !== 'tree') {
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 2;
        ctx.strokeRect(region.x, region.y, region.w, region.h);
      }

      // Draw label for barrier
      if (region.type === 'barrier' && region.label) {
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 18px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        // Draw the text multiple times across the barrier
        for(let tx = region.x + 200; tx < region.x + region.w; tx += 400) {
           ctx.fillText(region.label, tx, region.y + region.h / 2);
        }
      }
    }

    // Draw grid lines to emphasize scale
    ctx.strokeStyle = 'rgba(255,255,255,0.05)';
    ctx.lineWidth = 1;
    for(let i=0; i<MAP_WIDTH; i+=100) {
      ctx.beginPath(); ctx.moveTo(i, 0); ctx.lineTo(i, MAP_HEIGHT); ctx.stroke();
    }
    for(let i=0; i<MAP_HEIGHT; i+=100) {
      ctx.beginPath(); ctx.moveTo(0, i); ctx.lineTo(MAP_WIDTH, i); ctx.stroke();
    }

    // 2. Draw Interaction Box (visual aid)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(NEXUS_DOOR_BOX.x, NEXUS_DOOR_BOX.y, NEXUS_DOOR_BOX.w, NEXUS_DOOR_BOX.h);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(NEXUS_DOOR_BOX.x, NEXUS_DOOR_BOX.y, NEXUS_DOOR_BOX.w, NEXUS_DOOR_BOX.h);

    // 3. Draw Player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    // Draw tiny eyes to indicate facing/direction (static for now)
    ctx.fillStyle = '#000';
    ctx.fillRect(player.x + 3, player.y + 4, 2, 2);
    ctx.fillRect(player.x + 11, player.y + 4, 2, 2);

    ctx.restore(); // Restore context to screen coordinates

    // 4. Draw HUD / Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 300, 60);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('WASD/Arrows to move', 20, 30);
    ctx.fillText('Find Nexus Building (Top) & Press SPACE', 20, 50);
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <canvas
        ref={canvasRef}
        width={VIEWPORT_W}
        height={VIEWPORT_H}
        style={{
          border: '4px solid #333',
          borderRadius: '8px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          imageRendering: 'pixelated', // crisp look
        }}
      />
    </div>
  );
};

export default GameCanvas;
