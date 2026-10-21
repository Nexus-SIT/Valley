import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import IsoPrototypeScene from './scenes/IsoPrototypeScene';
import { requestLandscapeOrientation } from '../../utils/orientationHelper';

/**
 * React is responsible for the website shell.
 * Phaser owns only the game canvas and game loop.
 */
export default function PhaserGame({ onInteract, controlsRef }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const onInteractRef = useRef(onInteract);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    if (controlsRef) {
      controlsRef.current = {
        setAxis: (x, y) => {
          gameRef.current?.registry?.events?.emit('set_virtual_axis', { x, y });
        },
        attack: () => {
          gameRef.current?.registry?.events?.emit('trigger_virtual_attack');
        },
        interact: () => {
          gameRef.current?.registry?.events?.emit('trigger_virtual_interact');
        },
      };
    }
  }, [controlsRef]);

  // Window event listeners for controls
  useEffect(() => {
    const handleMove = (e) => {
      gameRef.current?.registry?.events?.emit('set_virtual_axis', e.detail);
    };
    const handleAttack = () => {
      gameRef.current?.registry?.events?.emit('trigger_virtual_attack');
    };
    const handleInteractEvent = () => {
      gameRef.current?.registry?.events?.emit('trigger_virtual_interact');
    };

    window.addEventListener('valley-virtual-move', handleMove);
    window.addEventListener('valley-virtual-attack', handleAttack);
    window.addEventListener('valley-virtual-interact', handleInteractEvent);

    return () => {
      window.removeEventListener('valley-virtual-move', handleMove);
      window.removeEventListener('valley-virtual-attack', handleAttack);
      window.removeEventListener('valley-virtual-interact', handleInteractEvent);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return undefined;

    requestLandscapeOrientation();

    const container = containerRef.current;
    const initialWidth = container.clientWidth || window.innerWidth;
    const initialHeight = container.clientHeight || window.innerHeight;

    const config = {
      type: Phaser.AUTO,
      parent: container,
      width: initialWidth,
      height: initialHeight,
      backgroundColor: '#0b1622',
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        width: initialWidth,
        height: initialHeight,
      },
      scene: [IsoPrototypeScene],
      audio: {
        noAudio: true,
      },
    };

    gameRef.current = new Phaser.Game(config);
    window.__PHASER_GAME__ = gameRef.current;
    gameRef.current.registry.set('onInteract', (...args) => onInteractRef.current?.(...args));

    // Handle container resizing (orientation change, dynamic browser toolbars)
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const { width, height } = entry.contentRect;
        if (width > 0 && height > 0 && gameRef.current?.scale) {
          gameRef.current.scale.resize(Math.round(width), Math.round(height));
        }
      }
    });

    resizeObserver.observe(container);

    const handleWindowResize = () => {
      if (container && gameRef.current?.scale) {
        const w = container.clientWidth || window.innerWidth;
        const h = container.clientHeight || window.innerHeight;
        if (w > 0 && h > 0) {
          gameRef.current.scale.resize(Math.round(w), Math.round(h));
        }
      }
    };

    window.addEventListener('resize', handleWindowResize);
    window.addEventListener('orientationchange', handleWindowResize);

    return () => {
      resizeObserver.disconnect();
      window.removeEventListener('resize', handleWindowResize);
      window.removeEventListener('orientationchange', handleWindowResize);
      window.__PHASER_GAME__ = null;
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className="valley-phaser-container"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
        touchAction: 'none',
      }}
    />
  );
}
