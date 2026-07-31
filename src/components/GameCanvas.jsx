import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { GameEngine } from '../game/engine';
import {
  REGIONS,
  MAP_WIDTH, MAP_HEIGHT,
  SPAWN_X, SPAWN_Y,
  NEXUS_DOOR_BOX, SIGN_BOX,
} from '../game/mapData';
import MapOverlay from './MapOverlay';

const ZOOM = 4;

// ─── Colour helpers ─────────────────────────────────────────────────────────
const hexToInt = (hex) => parseInt(hex.replace('#', ''), 16);

// ─── Campus-map-style building renderer ─────────────────────────────────────
// Produces a top-down "hip roof" look matching campus_map.png:
//   tan  outer border  →  dark-blue eave  →  mid-blue slope  →  bright-blue flat top
//   + light-blue sun-glint on the top/left edges
//   + subtle horizontal panel lines
function drawCampusBuilding(gfx, x, y, w, h) {
  const WALL  = 10;   // tan border thickness (game units — visible wall from above)
  const STEP  =  5;   // each hip-roof tier thickness

  // 1 ── Drop shadow
  gfx.fillStyle(0x000000, 0.20);
  gfx.fillRect(x + 4, y + 4, w, h);

  // 2 ── Tan / beige surround  (walls seen from above)
  gfx.fillStyle(0xc9aa80, 1);
  gfx.fillRect(x, y, w, h);

  // 3 ── Hip roof — 3 nested rects, darkest→brightest (eave → slope → flat top)
  gfx.fillStyle(0x2a5498, 1);               // darkest outer eave
  gfx.fillRect(x + WALL,          y + WALL,
               w - WALL * 2,      h - WALL * 2);

  gfx.fillStyle(0x3a6ab0, 1);              // mid slope
  gfx.fillRect(x + WALL + STEP,       y + WALL + STEP,
               w - WALL * 2 - STEP * 2, h - WALL * 2 - STEP * 2);

  gfx.fillStyle(0x4a80c4, 1);              // brightest flat-top centre
  gfx.fillRect(x + WALL + STEP * 2,       y + WALL + STEP * 2,
               w - WALL * 2 - STEP * 4, h - WALL * 2 - STEP * 4);

  // 4 ── Sun glint  (lighter strip along top & left edges of the flat top)
  const rl = x + WALL + STEP * 2;
  const rt = y + WALL + STEP * 2;
  const rw = w - WALL * 2 - STEP * 4;
  const rh = h - WALL * 2 - STEP * 4;

  gfx.fillStyle(0x82bcf0, 0.50);
  gfx.fillRect(rl, rt, rw, STEP * 1.4);   // top glint strip
  gfx.fillRect(rl, rt, STEP * 1.4, rh);   // left glint strip

  // 5 ── Horizontal roof-panel lines (every 40 game units)
  gfx.lineStyle(0.6, 0x2a5498, 0.28);
  for (let py = rt + 40; py < rt + rh; py += 40) {
    gfx.lineBetween(rl, py, rl + rw, py);
  }

  // 6 ── Outer wall outline
  gfx.lineStyle(1.5, 0x9a7d55, 1);
  gfx.strokeRect(x, y, w, h);
}

// ─── Static world draw (called once in create()) ──────────────────────────
function drawWorld(gfx) {
  for (const region of REGIONS) {
    // ── Sign ──────────────────────────────────────────────────────────────
    if (region.type === 'sign') {
      gfx.fillStyle(0x5c4033);
      gfx.fillRect(region.x + region.w / 2 - 2, region.y + 10, 4, 10);
      gfx.fillStyle(hexToInt(region.color));
      gfx.fillRect(region.x, region.y, region.w, 15);
      gfx.lineStyle(1, 0x3d2b1f, 1);
      gfx.strokeRect(region.x, region.y, region.w, 15);
      continue;
    }

    // ── Building 1  — campus-map hip-roof style ───────────────────────────
    if (region.id === 'admin_block_1') {
      drawCampusBuilding(gfx, region.x, region.y, region.w, region.h);
      continue;
    }

    // ── All other regions — plain colour rect ─────────────────────────────
    gfx.fillStyle(hexToInt(region.color));
    gfx.fillRect(region.x, region.y, region.w, region.h);

    if (region.solid && region.type !== 'tree') {
      gfx.lineStyle(0.5, 0x000000, 0.30);
      gfx.strokeRect(region.x, region.y, region.w, region.h);
    }
  }

  // ── Subtle world grid ─────────────────────────────────────────────────
  gfx.lineStyle(1, 0xffffff, 0.04);
  for (let i = 0; i < MAP_WIDTH;  i += 100) gfx.lineBetween(i, 0, i, MAP_HEIGHT);
  for (let i = 0; i < MAP_HEIGHT; i += 100) gfx.lineBetween(0, i, MAP_WIDTH, i);

  // ── Interaction zone indicators ────────────────────────────────────────
  [NEXUS_DOOR_BOX, SIGN_BOX].forEach((box) => {
    gfx.fillStyle(0x00ffff, 0.15);
    gfx.fillRect(box.x, box.y, box.w, box.h);
    gfx.lineStyle(2, 0x00ffff, 1);
    gfx.strokeRect(box.x, box.y, box.w, box.h);
  });
}

// ─── Component ───────────────────────────────────────────────────────────────
const GameCanvas = ({ onInteract }) => {
  const containerRef   = useRef(null);
  const gameRef        = useRef(null);
  const engineRef      = useRef(null);
  const setPosRef      = useRef(null);   // stable ref to React setter (avoid closure stale)

  const [playerPos, setPlayerPos] = useState({ x: SPAWN_X, y: SPAWN_Y });
  setPosRef.current = setPlayerPos;

  const handleTeleport = useCallback((tx, ty) => {
    const eng = engineRef.current;
    if (!eng) return;
    if (typeof eng.teleportPlayer === 'function') {
      eng.teleportPlayer(tx, ty);
    } else {
      eng.player.x = tx;
      eng.player.y = ty;
    }
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;

    // ── Game engine (movement + collision — unchanged) ─────────────────
    engineRef.current = new GameEngine(SPAWN_X, SPAWN_Y, onInteract);
    const engine = engineRef.current;

    // ── Phaser Scene ──────────────────────────────────────────────────
    class WorldScene extends Phaser.Scene {
      constructor() { super({ key: 'World' }); }

      preload() {
        // walk1–4 are the actual walk-cycle frames (same sprite for all directions)
        for (let f = 1; f <= 4; f++) {
          this.load.image(`p_walk_${f}`, `/characters/main/walk${f}.png`);
        }
        // manish.png = static standing pose
        this.load.image('p_stand', '/characters/main/manish.png');
      }

      create() {
        // ── Draw entire static world once ───────────────────────────
        const gfx = this.add.graphics();
        drawWorld(gfx);

        // ── Player sprite ───────────────────────────────────────────
        const p = engine.player;
        this.pImg = this.add
          .image(p.x + p.width / 2, p.y + p.height, 'p_stand')
          .setOrigin(0.5, 1);

        // Scale sprite to 1.5× collision-box height in world units
        this.pImg.displayHeight = p.height * 1.5;
        this.pImg.scaleX = this.pImg.scaleY;   // maintain aspect ratio

        // ── Camera — follows player, zoom matches the old ZOOM=4 ────
        this.cameras.main
          .setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
          .startFollow(this.pImg, true, 1, 1)
          .setZoom(ZOOM)
          .setRoundPixels(true);
      }

      update() {
        engine.update();
        const p = engine.player;

        // Reposition sprite
        this.pImg.x = p.x + p.width / 2;
        this.pImg.y = p.y + p.height;

        // Re-apply height scale when texture changes (natural size may differ)
        const targetH = p.height * 1.5;
        if (Math.abs(this.pImg.displayHeight - targetH) > 0.5) {
          this.pImg.displayHeight = targetH;
          this.pImg.scaleX = this.pImg.scaleY;
        }

        // Pick the correct walk frame
        const tex = p.isMoving
          ? `p_walk_${p.animFrame + 1}`   // animate through walk1–4
          : 'p_stand';                    // standing still
        if (this.pImg.texture.key !== tex) {
          this.pImg.setTexture(tex);
          // Re-apply scale after texture swap (natural dimensions may differ)
          this.pImg.displayHeight = p.height * 1.5;
          this.pImg.scaleX = this.pImg.scaleY;
        }

        // Publish position to React (for MapOverlay)
        setPosRef.current({ x: Math.round(p.x), y: Math.round(p.y) });
      }
    }

    // ── Phaser game — single canvas, no overlay needed ────────────────
    const game = new Phaser.Game({
      type            : Phaser.AUTO,
      width           : window.innerWidth,
      height          : window.innerHeight,
      backgroundColor : '#000000',
      parent          : containerRef.current,
      scene           : WorldScene,
      audio           : { noAudio: true },
    });

    gameRef.current = game;

    // Ensure the Phaser canvas is pixel-perfect behind the HTML overlays
    game.events.once('ready', () => {
      const cv = containerRef.current?.querySelector('canvas');
      if (cv) {
        Object.assign(cv.style, {
          position       : 'absolute',
          top            : '0',
          left           : '0',
          imageRendering : 'pixelated',
        });
      }
    });

    // Keyboard — engine.js still handles all movement logic
    window.addEventListener('keydown', engine.handleKeyDown);
    window.addEventListener('keyup',   engine.handleKeyUp);

    const onResize = () => gameRef.current?.scale?.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('keydown', engine.handleKeyDown);
      window.removeEventListener('keyup',   engine.handleKeyUp);
      window.removeEventListener('resize',  onResize);
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onInteract]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Phaser renders here — the single game canvas */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {/* HUD — HTML div sits above Phaser canvas, ignores pointer events */}
      <div style={{
        position      : 'absolute',
        top           : 10,
        left          : 10,
        background    : 'rgba(0,0,0,0.60)',
        color         : '#fff',
        padding       : '8px 14px',
        fontFamily    : 'Inter, sans-serif',
        fontSize      : '14px',
        lineHeight    : '1.6',
        pointerEvents : 'none',
        zIndex        : 20,
        borderRadius  : '3px',
      }}>
        <div>WASD / Arrows to move</div>
        <div>Find Nexus Building (Top) &amp; Press SPACE</div>
      </div>

      {/* Map overlay — already has its own positioning & z-index */}
      <MapOverlay playerPos={playerPos} onTeleport={handleTeleport} />
    </div>
  );
};

export default GameCanvas;
