import { useRef, useState, useEffect, useCallback } from 'react';
import './OnScreenControls.css';

/**
 * OnScreenControls:
 * 1. Large circular virtual joystick at bottom-left with metallic rings,
 *    cyan glow, directional arrows (Up/Down/Left/Right), and smooth drag input.
 * 2. Circular fantasy RPG weapon button at bottom-right with pixel sword icon,
 *    haptic/press feedback, and short attack cooldown.
 * 3. Mobile interact button for accessible dialog/terminal interaction.
 */
export default function OnScreenControls({ onMove, onAttack, onInteract }) {
  const baseRef = useRef(null);
  const knobRef = useRef(null);
  const activePointerIdRef = useRef(null);

  const [isDragging, setIsDragging] = useState(false);
  const [activeArrows, setActiveArrows] = useState({
    up: false,
    down: false,
    left: false,
    right: false,
  });

  const [isAttackPressed, setIsAttackPressed] = useState(false);
  const [attackCooldown, setAttackCooldown] = useState(false);
  const [isInteractPressed, setIsInteractPressed] = useState(false);

  // ── Joystick Logic ─────────────────────────────────────────────
  const updateJoystick = useCallback((clientX, clientY) => {
    const base = baseRef.current;
    if (!base) return;

    const rect = base.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const dx = clientX - centerX;
    const dy = clientY - centerY;
    const dist = Math.hypot(dx, dy);
    const maxRadius = (rect.width / 2) - 16; // Edge limit for knob

    let clampedX = 0;
    let clampedY = 0;
    let normX = 0;
    let normY = 0;

    if (dist > 0) {
      const clampedDist = Math.min(dist, maxRadius);
      clampedX = (dx / dist) * clampedDist;
      clampedY = (dy / dist) * clampedDist;
      normX = clampedX / maxRadius;
      normY = clampedY / maxRadius;
    }

    // Apply deadzone to prevent accidental jitter
    const deadzone = 0.12;
    if (Math.hypot(normX, normY) < deadzone) {
      normX = 0;
      normY = 0;
    }

    // Direct DOM translation for smooth 60fps tracking
    if (knobRef.current) {
      knobRef.current.style.transform = `translate(${clampedX}px, ${clampedY}px)`;
    }

    // Highlight directional arrows
    setActiveArrows({
      up: normY < -0.28,
      down: normY > 0.28,
      left: normX < -0.28,
      right: normX > 0.28,
    });

    // Notify Phaser game
    onMove?.(normX, normY);
  }, [onMove]);

  const resetJoystick = useCallback(() => {
    if (knobRef.current) {
      knobRef.current.style.transform = 'translate(0px, 0px)';
    }
    setActiveArrows({ up: false, down: false, left: false, right: false });
    onMove?.(0, 0);
  }, [onMove]);

  const handlePointerDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const base = baseRef.current;
    if (!base) return;

    activePointerIdRef.current = e.pointerId;
    try {
      base.setPointerCapture(e.pointerId);
    } catch (err) {
      void err;
    }

    setIsDragging(true);
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerMove = (e) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    updateJoystick(e.clientX, e.clientY);
  };

  const handlePointerUp = (e) => {
    if (activePointerIdRef.current !== e.pointerId) return;
    e.preventDefault();
    e.stopPropagation();
    try {
      baseRef.current?.releasePointerCapture(e.pointerId);
    } catch (err) {
      void err;
    }
    activePointerIdRef.current = null;
    setIsDragging(false);
    resetJoystick();
  };

  // Clean up input state on unmount
  useEffect(() => {
    return () => {
      onMove?.(0, 0);
    };
  }, [onMove]);

  // ── Attack Action Logic ────────────────────────────────────────
  const triggerAttack = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    if (attackCooldown) return;

    setAttackCooldown(true);
    setIsAttackPressed(true);
    setTimeout(() => setIsAttackPressed(false), 120);
    setTimeout(() => setAttackCooldown(false), 350);

    onAttack?.();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(25);
      } catch (err) {
        void err;
      }
    }
  }, [attackCooldown, onAttack]);

  // ── Interact Action Logic ──────────────────────────────────────
  const triggerInteract = useCallback((e) => {
    e?.preventDefault();
    e?.stopPropagation();
    setIsInteractPressed(true);
    setTimeout(() => setIsInteractPressed(false), 140);

    onInteract?.();

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try {
        navigator.vibrate(20);
      } catch (err) {
        void err;
      }
    }
  }, [onInteract]);

  return (
    <div className="valley-touch-controls" aria-label="Game On-Screen Controls">
      {/* ── 1. Circular Virtual Movement Controller (Bottom-Left) ── */}
      <div className="v-joystick-container">
        <div
          ref={baseRef}
          className={`v-joystick-base ${isDragging ? 'dragging' : ''}`}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
          onPointerCancel={handlePointerUp}
          role="slider"
          aria-label="Directional Movement Joystick"
        >
          {/* Inner Glowing Track */}
          <div className="v-joystick-track" />

          {/* Directional Arrows */}
          <span className={`v-joystick-arrow v-arrow-up ${activeArrows.up ? 'active' : ''}`}>
            ▲
          </span>
          <span className={`v-joystick-arrow v-arrow-down ${activeArrows.down ? 'active' : ''}`}>
            ▼
          </span>
          <span className={`v-joystick-arrow v-arrow-left ${activeArrows.left ? 'active' : ''}`}>
            ◀
          </span>
          <span className={`v-joystick-arrow v-arrow-right ${activeArrows.right ? 'active' : ''}`}>
            ▶
          </span>

          {/* Central Movable Knob */}
          <div
            ref={knobRef}
            className={`v-joystick-knob ${isDragging ? 'dragging' : ''}`}
          >
            <div className="v-knob-gem">
              <span>◆</span>
            </div>
          </div>
        </div>

        <span className="v-joystick-label">MOVE</span>
      </div>

      {/* ── 2. Action Controls Group (Bottom-Right) ───────────────── */}
      <div className="v-action-group">
        {/* Secondary Interact [E] Button for Mobile Convenience */}
        <button
          type="button"
          className={`v-btn-interact ${isInteractPressed ? 'pressed' : ''}`}
          onPointerDown={triggerInteract}
          aria-label="Interact"
          title="Interact (E)"
        >
          <span className="v-interact-icon">💬</span>
          <span className="v-interact-text">TALK</span>
        </button>

        {/* Primary Weapon / Attack Button */}
        <div className="v-attack-wrapper">
          <button
            type="button"
            className={`v-btn-attack ${isAttackPressed ? 'pressed' : ''} ${attackCooldown ? 'cooldown' : ''}`}
            onPointerDown={triggerAttack}
            aria-label="Weapon Attack"
            title="Attack (Space / J)"
          >
            {/* Crisp 8-Bit Pixel Sword Icon */}
            <svg
              className="v-sword-icon"
              viewBox="0 0 32 32"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              shapeRendering="crispEdges"
            >
              {/* Blade tip */}
              <rect x="25" y="5" width="2" height="2" fill="#FFFFFF" />
              <rect x="23" y="7" width="2" height="2" fill="#E0F2FE" />
              <rect x="25" y="7" width="2" height="2" fill="#38BDF8" />

              {/* Blade body & edge */}
              <rect x="21" y="9" width="2" height="2" fill="#FFFFFF" />
              <rect x="23" y="9" width="2" height="2" fill="#BAE6FD" />
              <rect x="19" y="11" width="2" height="2" fill="#FFFFFF" />
              <rect x="21" y="11" width="2" height="2" fill="#BAE6FD" />
              <rect x="17" y="13" width="2" height="2" fill="#FFFFFF" />
              <rect x="19" y="13" width="2" height="2" fill="#38BDF8" />
              <rect x="15" y="15" width="2" height="2" fill="#FFFFFF" />
              <rect x="17" y="15" width="2" height="2" fill="#38BDF8" />

              {/* Central Fuller Line (cyan core) */}
              <rect x="23" y="8" width="1" height="1" fill="#0284C7" />
              <rect x="20" y="11" width="1" height="1" fill="#0284C7" />
              <rect x="17" y="14" width="1" height="1" fill="#0284C7" />

              {/* Crossguard (Golden / Bronze Wings) */}
              <rect x="11" y="15" width="3" height="3" fill="#D97706" />
              <rect x="13" y="17" width="3" height="3" fill="#F59E0B" />
              <rect x="15" y="19" width="3" height="3" fill="#F59E0B" />
              <rect x="17" y="21" width="3" height="3" fill="#D97706" />
              {/* Center gem in crossguard */}
              <rect x="14" y="18" width="2" height="2" fill="#00F5FF" />

              {/* Handle / Grip */}
              <rect x="11" y="21" width="2" height="2" fill="#78350F" />
              <rect x="9" y="23" width="2" height="2" fill="#451A03" />

              {/* Pommel */}
              <rect x="7" y="25" width="3" height="3" fill="#F59E0B" />
              <rect x="6" y="26" width="2" height="2" fill="#FDE047" />
            </svg>
          </button>

          <span className="v-attack-label">ATTACK</span>
          <span className="v-key-hint">[SPACE / J]</span>
        </div>
      </div>
    </div>
  );
}
