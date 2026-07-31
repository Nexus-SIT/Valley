import { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import { REGIONS, MAP_WIDTH, MAP_HEIGHT, SPAWN_X, SPAWN_Y, NEXUS_DOOR_BOX, SIGN_BOX } from '../game/mapData';
import MapOverlay from './MapOverlay';

const ZOOM = 4; // Zoom factor to make character visible

const GameCanvas = ({ onInteract }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reqRef = useRef(null);
  
  // Directions map to row indices 1, 2, 3, 4
  const playerImagesRef = useRef({
    down: [],
    up: [],
    left: [],
    right: []
  });
  const [dimensions, setDimensions] = useState({ w: window.innerWidth, h: window.innerHeight });
  const [playerPos, setPlayerPos] = useState({ x: SPAWN_X, y: SPAWN_Y });

  useEffect(() => {
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    // Initialize directional images
    // Row 1: down, Row 2: up, Row 3: left, Row 4: right
    const dirMap = ['down', 'up', 'left', 'right'];
    
    dirMap.forEach((dir, rowIndex) => {
      playerImagesRef.current[dir] = [];
      for (let colIndex = 1; colIndex <= 4; colIndex++) {
        const img = new Image();
        img.src = `/characters/main/${rowIndex + 1}.${colIndex}.png`;
        // Fallback to manish.png if the file doesn't exist yet so the game doesn't break
        img.onerror = () => {
          if (!img.fallbackAttempted) {
            img.fallbackAttempted = true;
            img.src = '/characters/main/manish.png';
          }
        };
        playerImagesRef.current[dir].push(img);
      }
    });

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    // Initialize engine
    engineRef.current = new GameEngine(SPAWN_X, SPAWN_Y, onInteract);

    // Event listeners
    window.addEventListener('keydown', engineRef.current.handleKeyDown);
    window.addEventListener('keyup', engineRef.current.handleKeyUp);

    // Game loop
    const loop = () => {
      engineRef.current.update();
      render(ctx, engineRef.current.player);
      
      // Update coordinates in React state for the map overlay in real time
      setPlayerPos({
        x: Math.round(engineRef.current.player.x),
        y: Math.round(engineRef.current.player.y)
      });
      
      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', engineRef.current.handleKeyDown);
      window.removeEventListener('keyup', engineRef.current.handleKeyUp);
      cancelAnimationFrame(reqRef.current);
    };
  }, [onInteract]);

  function render(ctx, player) {
    const VIEWPORT_W = window.innerWidth;
    const VIEWPORT_H = window.innerHeight;

    // Calculate Camera Position (centered on player, accounting for zoom)
    let camX = player.x + player.width / 2 - (VIEWPORT_W / ZOOM) / 2;
    let camY = player.y + player.height / 2 - (VIEWPORT_H / ZOOM) / 2;

    // Clamp camera to map boundaries
    camX = Math.max(0, Math.min(camX, MAP_WIDTH - (VIEWPORT_W / ZOOM)));
    camY = Math.max(0, Math.min(camY, MAP_HEIGHT - (VIEWPORT_H / ZOOM)));

    // Clear and fill base (just in case)
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    ctx.save();
    // Apply zoom scaling and translate the context by the camera offset
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-camX, -camY);

    // 1. Draw Regions
    for (let region of REGIONS) {
      // Basic culling: don't draw if outside viewport
      if (
        region.x + region.w < camX ||
        region.x > camX + (VIEWPORT_W / ZOOM) ||
        region.y + region.h < camY ||
        region.y > camY + (VIEWPORT_H / ZOOM)
      ) {
        continue; // skip
      }

      if (region.type === 'sign') {
        // Draw sign post
        ctx.fillStyle = '#5c4033'; // darker brown post
        ctx.fillRect(region.x + region.w / 2 - 2, region.y + 10, 4, 10);
        // Draw sign board
        ctx.fillStyle = region.color;
        ctx.fillRect(region.x, region.y, region.w, 15);
        ctx.strokeStyle = '#3d2b1f';
        ctx.lineWidth = 1;
        ctx.strokeRect(region.x, region.y, region.w, 15);
        continue;
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

    // 2. Draw Interaction Boxes (visual aid)
    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(NEXUS_DOOR_BOX.x, NEXUS_DOOR_BOX.y, NEXUS_DOOR_BOX.w, NEXUS_DOOR_BOX.h);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(NEXUS_DOOR_BOX.x, NEXUS_DOOR_BOX.y, NEXUS_DOOR_BOX.w, NEXUS_DOOR_BOX.h);

    ctx.fillStyle = 'rgba(0, 255, 255, 0.2)';
    ctx.fillRect(SIGN_BOX.x, SIGN_BOX.y, SIGN_BOX.w, SIGN_BOX.h);
    ctx.strokeStyle = '#0ff';
    ctx.strokeRect(SIGN_BOX.x, SIGN_BOX.y, SIGN_BOX.w, SIGN_BOX.h);

    // 3. Draw Player
    const dirFrames = playerImagesRef.current[player.direction];
    let currentImg = dirFrames && dirFrames.length > 0 ? dirFrames[0] : null; // Default to STAND frame
    
    if (player.isMoving && dirFrames && dirFrames.length === 4) {
      currentImg = dirFrames[player.animFrame];
    }

    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      const natW = currentImg.naturalWidth;
      const natH = currentImg.naturalHeight;
      
      // Scale image to a reasonable size relative to the collision box
      // Let's make it about 1.5x the height of the collision box
      const drawH = player.height * 1.5; 
      const drawW = drawH * (natW / natH);
      
      // Align bottom-center of the image with the bottom-center of the collision box.
      const drawX = player.x + (player.width - drawW) / 2;
      const drawY = player.y + (player.height - drawH);

      ctx.drawImage(currentImg, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
      // Draw tiny eyes to indicate facing/direction (static for now)
      ctx.fillStyle = '#000';
      ctx.fillRect(player.x + 3, player.y + 4, 2, 2);
      ctx.fillRect(player.x + 11, player.y + 4, 2, 2);
    }

    ctx.restore(); // Restore context to screen coordinates

    // 4. Draw HUD / Overlay
    ctx.fillStyle = 'rgba(0, 0, 0, 0.6)';
    ctx.fillRect(10, 10, 300, 60);
    ctx.fillStyle = '#fff';
    ctx.font = '14px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('WASD/Arrows to move', 20, 30);
    ctx.fillText('Find Nexus Building (Top) & Press SPACE', 20, 50);
  }

  const handleTeleport = (targetX, targetY) => {
    if (engineRef.current && typeof engineRef.current.teleportPlayer === 'function') {
      engineRef.current.teleportPlayer(targetX, targetY);
      setPlayerPos({
        x: Math.round(engineRef.current.player.x),
        y: Math.round(engineRef.current.player.y)
      });
    }
  };

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
      <canvas
        ref={canvasRef}
        width={dimensions.w}
        height={dimensions.h}
        style={{
          display: 'block',
          width: '100%',
          height: '100%',
          imageRendering: 'pixelated', // crisp look
        }}
      />
      <MapOverlay playerPos={playerPos} onTeleport={handleTeleport} />
    </div>
  );
};

export default GameCanvas;
