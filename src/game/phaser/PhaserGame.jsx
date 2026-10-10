import { useEffect, useRef } from 'react';
import Phaser from 'phaser';
import IsoPrototypeScene from './scenes/IsoPrototypeScene';

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
      audio: {
        noAudio: true,
      },
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
