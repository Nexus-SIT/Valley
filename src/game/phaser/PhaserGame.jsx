import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import IsoPrototypeScene from './scenes/IsoPrototypeScene';

/**
 * React is responsible for the website shell.
 * Phaser owns only the game canvas and game loop.
 */
export default function PhaserGame({ onInteract }) {
  const containerRef = useRef(null);
  const gameRef = useRef(null);
  const onInteractRef = useRef(onInteract);

  useEffect(() => {
    onInteractRef.current = onInteract;
  }, [onInteract]);

  useEffect(() => {
    if (!containerRef.current || gameRef.current) return undefined;

    const config = {
      type: Phaser.AUTO,
      parent: containerRef.current,
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#111827',
      pixelArt: true,
      antialias: false,
      roundPixels: true,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: [IsoPrototypeScene],
    };

    gameRef.current = new Phaser.Game(config);
    gameRef.current.registry.set('onInteract', (...args) => onInteractRef.current?.(...args));

    return () => {
      gameRef.current?.destroy(true);
      gameRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        overflow: 'hidden',
      }}
    />
  );
}
