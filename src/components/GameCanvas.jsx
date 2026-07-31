import { useEffect, useRef, useState, useCallback } from 'react';
import Phaser from 'phaser';
import { GameEngine } from '../game/engine';
import {
  MAP_WIDTH, MAP_HEIGHT,
  SPAWN_X, SPAWN_Y
} from '../game/mapData';
import MapOverlay from './MapOverlay';

const DEFAULT_ZOOM = 1.5;
const MIN_ZOOM = 1;
const MAX_ZOOM = 8;

const GameCanvas = ({ onInteract }) => {
  const containerRef   = useRef(null);
  const gameRef        = useRef(null);
  const engineRef      = useRef(null);
  const setPosRef      = useRef(null);
  const [zoomLevel, setZoomLevel] = useState(DEFAULT_ZOOM);

  const [gameState, setGameState] = useState({ 
    playerX: SPAWN_X, 
    playerY: SPAWN_Y, 
    camX: 0, camY: 0, camW: 0, camH: 0 
  });
  setPosRef.current = setGameState;

  const updateCameraZoom = useCallback((newZoom) => {
    const clamped = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number(newZoom.toFixed(1))));
    setZoomLevel(clamped);
    if (gameRef.current && gameRef.current.scene && gameRef.current.scene.scenes[0]) {
      const cam = gameRef.current.scene.scenes[0].cameras.main;
      if (cam) cam.setZoom(clamped);
    }
  }, []);

  const handleZoomIn = () => updateCameraZoom(zoomLevel + 0.5);
  const handleZoomOut = () => updateCameraZoom(zoomLevel - 0.5);
  const handleResetZoom = () => updateCameraZoom(DEFAULT_ZOOM);

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

    engineRef.current = new GameEngine(SPAWN_X, SPAWN_Y, onInteract);
    const engine = engineRef.current;

    class WorldScene extends Phaser.Scene {
      constructor() { super({ key: 'World' }); }

      preload() {
        for (let f = 1; f <= 4; f++) {
          this.load.image(`p_walk_${f}`, `/characters/main/walk${f}.png`);
        }
        this.load.image('p_stand', '/characters/main/manish.png');
        this.load.image('campus_map', '/campus_map.png');
      }

      create() {
        const bgMap = this.add.image(0, 0, 'campus_map').setOrigin(0, 0);
        bgMap.setDisplaySize(MAP_WIDTH, MAP_HEIGHT);

        const p = engine.player;
        this.pImg = this.add
          .image(p.x + p.width / 2, p.y + p.height, 'p_stand')
          .setOrigin(0.5, 1);

        this.pImg.displayHeight = p.height * 1.5;
        this.pImg.scaleX = this.pImg.scaleY;

        this.cameras.main
          .setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
          .startFollow(this.pImg, true, 1, 1)
          .setZoom(DEFAULT_ZOOM)
          .setRoundPixels(true);
      }

      update(time, delta) {
        engine.update(delta);
        const p = engine.player;

        this.pImg.x = p.x + p.width / 2;
        this.pImg.y = p.y + p.height;

        const targetH = p.height * 1.5;
        if (Math.abs(this.pImg.displayHeight - targetH) > 0.5) {
          this.pImg.displayHeight = targetH;
          this.pImg.scaleX = this.pImg.scaleY;
        }

        const tex = p.isMoving
          ? `p_walk_${p.animFrame + 1}`
          : 'p_stand';
        if (this.pImg.texture.key !== tex) {
          this.pImg.setTexture(tex);
          this.pImg.displayHeight = p.height * 1.5;
          this.pImg.scaleX = this.pImg.scaleY;
        }

        const cam = this.cameras.main;
        setPosRef.current({ 
          playerX: Math.round(this.pImg.x), 
          playerY: Math.round(this.pImg.y),
          camX: Math.round(cam.worldView.x),
          camY: Math.round(cam.worldView.y),
          camW: Math.round(cam.worldView.width),
          camH: Math.round(cam.worldView.height)
        });
      }
    }

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

    window.addEventListener('keydown', engine.handleKeyDown);
    window.addEventListener('keyup',   engine.handleKeyUp);

    // Mouse Wheel Zoom
    const handleWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 0.5 : -0.5;
      setZoomLevel((prev) => {
        const next = Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, Number((prev + delta).toFixed(1))));
        if (gameRef.current?.scene?.scenes[0]?.cameras?.main) {
          gameRef.current.scene.scenes[0].cameras.main.setZoom(next);
        }
        return next;
      });
    };

    const containerEl = containerRef.current;
    if (containerEl) {
      containerEl.addEventListener('wheel', handleWheel, { passive: false });
    }

    const onResize = () => gameRef.current?.scale?.resize(window.innerWidth, window.innerHeight);
    window.addEventListener('resize', onResize);

    return () => {
      window.removeEventListener('keydown', engine.handleKeyDown);
      window.removeEventListener('keyup',   engine.handleKeyUp);
      window.removeEventListener('resize',  onResize);
      if (containerEl) {
        containerEl.removeEventListener('wheel', handleWheel);
      }
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, [onInteract]);

  return (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>

      {/* Phaser Canvas Container */}
      <div
        ref={containerRef}
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
      />

      {/* Modern Zoom Controls Floating Widget (Bottom Left) */}
      <div style={styles.zoomWidget}>
        <button 
          onClick={handleZoomIn} 
          style={styles.zoomBtn} 
          title="Zoom In (or Scroll Up)"
        >
          ➕
        </button>
        <button 
          onClick={handleResetZoom} 
          style={styles.zoomLabelBtn} 
          title="Reset Zoom to 4.0x"
        >
          {zoomLevel.toFixed(1)}x
        </button>
        <button 
          onClick={handleZoomOut} 
          style={styles.zoomBtn} 
          title="Zoom Out (or Scroll Down)"
        >
          ➖
        </button>
      </div>

      {/* Map overlay */}
      <MapOverlay gameState={gameState} onTeleport={handleTeleport} />
    </div>
  );
};

const styles = {
  zoomWidget: {
    position: 'fixed',
    bottom: '24px',
    left: '24px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    backgroundColor: 'rgba(20, 24, 33, 0.85)',
    backdropFilter: 'blur(10px)',
    border: '1px solid rgba(255, 255, 255, 0.15)',
    borderRadius: '12px',
    padding: '6px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.5)',
    zIndex: 90,
    userSelect: 'none'
  },
  zoomBtn: {
    width: '36px',
    height: '36px',
    borderRadius: '8px',
    border: 'none',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    color: '#fff',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    transition: 'all 0.2s ease',
  },
  zoomLabelBtn: {
    padding: '4px 0',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'transparent',
    color: '#60efff',
    fontSize: '11px',
    fontWeight: 'bold',
    fontFamily: "'Inter', sans-serif",
    cursor: 'pointer',
    textAlign: 'center',
  }
};

export default GameCanvas;
