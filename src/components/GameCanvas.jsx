import React, { useEffect, useRef, useState } from 'react';
import { GameEngine } from '../game/engine';
import {
  MAP_WIDTH,
  MAP_HEIGHT,
  MAP_COLS,
  MAP_ROWS,
  TILE_WIDTH,
  TILE_HEIGHT,
  TILE_DATA,
  TILESETS,
  SPAWN_X,
  SPAWN_Y,
  NEXUS_DOOR_BOX,
  SIGN_BOX
} from '../game/mapData';
import MapOverlay from './MapOverlay';

const ZOOM = 2.8;

const GameCanvas = ({ onInteract }) => {
  const canvasRef = useRef(null);
  const engineRef = useRef(null);
  const reqRef = useRef(null);
  const mapCanvasRef = useRef(null);
  const ts1ImgRef = useRef(null);
  const ts2ImgRef = useRef(null);
  const tilesetsLoadedRef = useRef(false);
  const [showGrid, setShowGrid] = useState(true);
  const showGridRef = useRef(true);

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
    showGridRef.current = showGrid;
  }, [showGrid]);

  useEffect(() => {
    const handleResize = () => setDimensions({ w: window.innerWidth, h: window.innerHeight });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Pre-load tilesets and bake offscreen buffer canvas
  useEffect(() => {
    let isCancelled = false;

    const ts1Img = new Image();
    const ts2Img = new Image();
    ts1ImgRef.current = ts1Img;
    ts2ImgRef.current = ts2Img;

    let loadedCount = 0;
    const checkAndBuild = () => {
      loadedCount++;
      if (loadedCount >= 2 && !isCancelled) {
        tilesetsLoadedRef.current = true;
        try {
          const offscreen = document.createElement('canvas');
          offscreen.width = MAP_WIDTH;
          offscreen.height = MAP_HEIGHT;
          const offCtx = offscreen.getContext('2d');
          offCtx.imageSmoothingEnabled = false;

          for (let row = 0; row < MAP_ROWS; row++) {
            for (let col = 0; col < MAP_COLS; col++) {
              const index = row * MAP_COLS + col;
              const gid = TILE_DATA[index];
              if (!gid || gid === 0) continue;

              let img = ts1Img;
              let localId = gid - 1;
              let cols = TILESETS[0].columns;

              if (gid >= TILESETS[1].firstgid) {
                img = ts2Img;
                localId = gid - TILESETS[1].firstgid;
                cols = TILESETS[1].columns;
              }

              const sx = (localId % cols) * TILE_WIDTH;
              const sy = Math.floor(localId / cols) * TILE_HEIGHT;
              const dx = col * TILE_WIDTH;
              const dy = row * TILE_HEIGHT;

              offCtx.drawImage(img, sx, sy, TILE_WIDTH, TILE_HEIGHT, dx, dy, TILE_WIDTH, TILE_HEIGHT);
            }
          }

          mapCanvasRef.current = offscreen;
        } catch (err) {
          console.error('Failed to bake map canvas:', err);
        }
      }
    };

    ts1Img.onload = checkAndBuild;
    ts2Img.onload = checkAndBuild;

    ts1Img.src = TILESETS[0].src;
    ts2Img.src = TILESETS[1].src;

    if (ts1Img.complete) checkAndBuild();
    if (ts2Img.complete) checkAndBuild();

    return () => {
      isCancelled = true;
    };
  }, []);

  useEffect(() => {
    // Initialize directional character images
    const dirMap = ['down', 'up', 'left', 'right'];
    
    dirMap.forEach((dir, rowIndex) => {
      playerImagesRef.current[dir] = [];
      for (let colIndex = 1; colIndex <= 4; colIndex++) {
        const img = new Image();
        img.src = `/characters/main/${rowIndex + 1}.${colIndex}.png`;
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
    ctx.imageSmoothingEnabled = false;

    // Initialize engine
    engineRef.current = new GameEngine(SPAWN_X, SPAWN_Y, onInteract);

    // Key listeners
    const onKeyDown = (e) => {
      if (e.key === 'g' || e.key === 'G') {
        setShowGrid(prev => !prev);
      }
      engineRef.current.handleKeyDown(e);
    };

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', engineRef.current.handleKeyUp);

    // Game loop
    const loop = () => {
      engineRef.current.update();
      render(ctx, engineRef.current.player);
      
      setPlayerPos({
        x: Math.round(engineRef.current.player.x),
        y: Math.round(engineRef.current.player.y)
      });
      
      reqRef.current = requestAnimationFrame(loop);
    };

    reqRef.current = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', engineRef.current.handleKeyUp);
      cancelAnimationFrame(reqRef.current);
    };
  }, [onInteract]);

  const render = (ctx, player) => {
    const VIEWPORT_W = window.innerWidth;
    const VIEWPORT_H = window.innerHeight;

    const viewW = VIEWPORT_W / ZOOM;
    const viewH = VIEWPORT_H / ZOOM;

    let camX = player.x + player.width / 2 - viewW / 2;
    let camY = player.y + player.height / 2 - viewH / 2;

    // Clamp camera to map boundaries
    camX = Math.max(0, Math.min(camX, MAP_WIDTH - viewW));
    camY = Math.max(0, Math.min(camY, MAP_HEIGHT - viewH));

    // Clear background
    ctx.fillStyle = '#1a2e15';
    ctx.fillRect(0, 0, VIEWPORT_W, VIEWPORT_H);

    ctx.save();
    ctx.scale(ZOOM, ZOOM);
    ctx.translate(-camX, -camY);

    // 1. Draw Map
    if (mapCanvasRef.current) {
      ctx.drawImage(mapCanvasRef.current, 0, 0);
    } else {
      // Direct viewport rendering fallback
      const startCol = Math.max(0, Math.floor(camX / TILE_WIDTH));
      const endCol = Math.min(MAP_COLS, Math.ceil((camX + viewW) / TILE_WIDTH) + 1);
      const startRow = Math.max(0, Math.floor(camY / TILE_HEIGHT));
      const endRow = Math.min(MAP_ROWS, Math.ceil((camY + viewH) / TILE_HEIGHT) + 1);

      const ts1Img = ts1ImgRef.current;
      const ts2Img = ts2ImgRef.current;

      for (let row = startRow; row < endRow; row++) {
        for (let col = startCol; col < endCol; col++) {
          const index = row * MAP_COLS + col;
          const gid = TILE_DATA[index];
          if (!gid || gid === 0) continue;

          let img = ts1Img;
          let localId = gid - 1;
          let cols = TILESETS[0].columns;

          if (gid >= TILESETS[1].firstgid) {
            img = ts2Img;
            localId = gid - TILESETS[1].firstgid;
            cols = TILESETS[1].columns;
          }

          if (img && img.complete && img.naturalWidth > 0) {
            const sx = (localId % cols) * TILE_WIDTH;
            const sy = Math.floor(localId / cols) * TILE_HEIGHT;
            const dx = col * TILE_WIDTH;
            const dy = row * TILE_HEIGHT;
            ctx.drawImage(img, sx, sy, TILE_WIDTH, TILE_HEIGHT, dx, dy, TILE_WIDTH, TILE_HEIGHT);
          }
        }
      }
    }

    // 2. Draw In-World Coordinate Grid & Labels (if enabled)
    if (showGridRef.current) {
      const step = 160; // 10 tiles (160 px) grid interval
      const startGridX = Math.floor(camX / step) * step;
      const endGridX = Math.min(MAP_WIDTH, Math.ceil((camX + viewW) / step) * step);
      const startGridY = Math.floor(camY / step) * step;
      const endGridY = Math.min(MAP_HEIGHT, Math.ceil((camY + viewH) / step) * step);

      // Grid Lines
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.beginPath();
      for (let gx = startGridX; gx <= endGridX; gx += step) {
        ctx.moveTo(gx, startGridY);
        ctx.lineTo(gx, endGridY);
      }
      for (let gy = startGridY; gy <= endGridY; gy += step) {
        ctx.moveTo(startGridX, gy);
        ctx.lineTo(endGridX, gy);
      }
      ctx.stroke();

      // Coordinate Text Markers at Intersections
      ctx.fillStyle = 'rgba(255, 255, 255, 0.45)';
      ctx.font = '700 8px monospace';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      for (let gx = startGridX; gx <= endGridX; gx += step) {
        for (let gy = startGridY; gy <= endGridY; gy += step) {
          ctx.fillText(`${gx},${gy}`, gx + 3, gy + 3);
        }
      }
    }

    // 3. Draw Interaction Indicators
    // Nexus Entrance
    ctx.fillStyle = 'rgba(96, 239, 255, 0.25)';
    ctx.fillRect(NEXUS_DOOR_BOX.x, NEXUS_DOOR_BOX.y, NEXUS_DOOR_BOX.w, NEXUS_DOOR_BOX.h);
    ctx.strokeStyle = '#60efff';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(NEXUS_DOOR_BOX.x, NEXUS_DOOR_BOX.y, NEXUS_DOOR_BOX.w, NEXUS_DOOR_BOX.h);

    // GitHub Sign
    ctx.fillStyle = 'rgba(255, 204, 0, 0.25)';
    ctx.fillRect(SIGN_BOX.x, SIGN_BOX.y, SIGN_BOX.w, SIGN_BOX.h);
    ctx.strokeStyle = '#ffcc00';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(SIGN_BOX.x, SIGN_BOX.y, SIGN_BOX.w, SIGN_BOX.h);

    // 4. Draw Player
    const dirFrames = playerImagesRef.current[player.direction];
    let currentImg = dirFrames && dirFrames.length > 0 ? dirFrames[0] : null;
    
    if (player.isMoving && dirFrames && dirFrames.length === 4) {
      currentImg = dirFrames[player.animFrame];
    }

    if (currentImg && currentImg.complete && currentImg.naturalWidth > 0) {
      const natW = currentImg.naturalWidth;
      const natH = currentImg.naturalHeight;
      const drawH = player.height * 1.6; 
      const drawW = drawH * (natW / natH);
      
      const drawX = player.x + (player.width - drawW) / 2;
      const drawY = player.y + (player.height - drawH);

      ctx.drawImage(currentImg, drawX, drawY, drawW, drawH);
    } else {
      ctx.fillStyle = player.color;
      ctx.fillRect(player.x, player.y, player.width, player.height);
      ctx.fillStyle = '#000';
      ctx.fillRect(player.x + 3, player.y + 3, 2, 2);
      ctx.fillRect(player.x + 9, player.y + 3, 2, 2);
    }

    // Overhead Floating Coordinate Tag
    const px = Math.round(player.x);
    const py = Math.round(player.y);
    const tagText = `${px}, ${py}`;
    ctx.font = 'bold 8px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    const tagWidth = ctx.measureText(tagText).width + 8;
    const tagH = 12;
    const tagX = player.x + player.width / 2;
    const tagY = player.y - 8;

    ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(tagX - tagWidth / 2, tagY - tagH, tagWidth, tagH, 3);
      ctx.fill();
    } else {
      ctx.fillRect(tagX - tagWidth / 2, tagY - tagH, tagWidth, tagH);
    }
    ctx.fillStyle = '#60efff';
    ctx.fillText(tagText, tagX, tagY - 2);

    ctx.restore();

    // 5. Modern Glassmorphism Coordinate & Navigation HUD (Top-Left)
    const hudW = 320;
    const hudH = 92;
    const hudX = 16;
    const hudY = 16;

    // HUD Background Card
    ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
    if (ctx.roundRect) {
      ctx.beginPath();
      ctx.roundRect(hudX, hudY, hudW, hudH, 10);
      ctx.fill();
    } else {
      ctx.fillRect(hudX, hudY, hudW, hudH);
    }
    ctx.strokeStyle = 'rgba(96, 239, 255, 0.3)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // HUD Header / Coordinates row
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Live World Coordinates Pill
    ctx.fillStyle = '#60efff';
    ctx.font = '700 13px "Courier New", monospace';
    ctx.fillText(`📍 X: ${px.toString().padStart(4, ' ')}  Y: ${py.toString().padStart(4, ' ')}`, hudX + 14, hudY + 12);

    // Tile Grid coordinates
    const tileCol = Math.floor(player.x / TILE_WIDTH);
    const tileRow = Math.floor(player.y / TILE_HEIGHT);
    ctx.fillStyle = '#94a3b8';
    ctx.font = '600 11px monospace';
    ctx.fillText(`🔲 Tile: [Col ${tileCol}, Row ${tileRow}]`, hudX + 14, hudY + 32);

    // Map info & Grid Toggle
    ctx.fillStyle = '#cbd5e1';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`🗺️ Map: ${MAP_WIDTH}×${MAP_HEIGHT}px • [G] Grid: ${showGridRef.current ? 'ON' : 'OFF'}`, hudX + 14, hudY + 50);

    // Controls prompt
    ctx.fillStyle = '#38bdf8';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.fillText(`🎮 WASD / Arrows to move • SPACE/E to interact`, hudX + 14, hudY + 68);
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
          imageRendering: 'pixelated',
        }}
      />
      <MapOverlay playerPos={playerPos} mapCanvas={mapCanvasRef.current} />
    </div>
  );
};

export default GameCanvas;
