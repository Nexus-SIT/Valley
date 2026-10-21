import React from 'react';
import './RotateOrientationPrompt.css';

/**
 * RotateOrientationPrompt
 * Displayed when playing on mobile in vertical (portrait) mode.
 * Instructs the player to turn their phone sideways to landscape mode,
 * with an animated phone rotation graphic and an automatic orientation/fullscreen lock button.
 */
export default function RotateOrientationPrompt({ onExit, onRequestLandscape }) {
  return (
    <div className="valley-rotate-overlay" role="dialog" aria-modal="true" aria-label="Rotate device to landscape">
      <div className="valley-rotate-card">
        {/* Animated Phone Rotation Visual */}
        <div className="valley-phone-animation-box">
          <svg className="valley-rotate-arrows-svg" viewBox="0 0 100 100" fill="none">
            <path
              d="M 22 45 A 28 28 0 0 1 72 25"
              stroke="#38bdf8"
              strokeWidth="2.5"
              strokeDasharray="4 3"
              strokeLinecap="round"
            />
            <polygon points="76,21 78,32 68,29" fill="#38bdf8" />
          </svg>

          <div className="valley-phone-icon-wrapper">
            <svg width="44" height="74" viewBox="0 0 44 74" fill="none" xmlns="http://www.w3.org/2000/svg">
              {/* Phone Body */}
              <rect
                x="2"
                y="2"
                width="40"
                height="70"
                rx="8"
                fill="#0f172a"
                stroke="#38bdf8"
                strokeWidth="2.5"
              />
              {/* Screen Display */}
              <rect
                x="6"
                y="10"
                width="32"
                height="52"
                rx="3"
                fill="#0284c7"
                fillOpacity="0.3"
                stroke="#0ea5e9"
                strokeWidth="1"
              />
              {/* Speaker / Camera Notch */}
              <rect x="18" y="5" width="8" height="2" rx="1" fill="#38bdf8" />
              {/* Home Indicator */}
              <rect x="17" y="66" width="10" height="2" rx="1" fill="#38bdf8" />
              {/* Screen Content Graphic (Mini pixel sword) */}
              <path
                d="M17 38 L27 28 M25 26 L29 30 M15 40 L19 44"
                stroke="#ffffff"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </div>
        </div>

        {/* Messaging */}
        <h2 className="valley-rotate-title">ROTATE PHONE</h2>
        <p className="valley-rotate-subtitle">
          Please rotate your phone horizontally to play Valley RPG.
        </p>
        <p className="valley-rotate-hint">
          Valley is optimized for widescreen landscape controls. Turn your phone sideways (ensure Auto-Rotate is unlocked).
        </p>

        {/* Buttons */}
        <div className="valley-rotate-btn-group">
          {onRequestLandscape && (
            <button
              type="button"
              className="valley-rotate-action-btn"
              onClick={onRequestLandscape}
              aria-label="Lock screen to landscape mode"
            >
              <span>⛶</span> FULLSCREEN LANDSCAPE
            </button>
          )}

          {onExit && (
            <button
              type="button"
              className="valley-rotate-exit-btn"
              onClick={onExit}
              aria-label="Exit to landing page"
            >
              ⬅ Return to Menu
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
