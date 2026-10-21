/**
 * Screen orientation helper for mobile devices.
 * Handles screen.orientation.lock('landscape') with fullscreen fallback,
 * browser compatibility checks, and mobile detection.
 */

export function isMobileDevice() {
  if (typeof window === 'undefined') return false;
  const userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
  const isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent);
  const isTouch = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
  const isCoarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
  const isSmallViewport = Math.min(window.innerWidth, window.innerHeight) <= 1024;

  return (isMobileUA || (isTouch && isCoarse)) && isSmallViewport;
}

export function isPortraitMode() {
  if (typeof window === 'undefined') return false;
  // If window.innerHeight > window.innerWidth, screen is in portrait
  return window.innerHeight > window.innerWidth;
}

export async function requestLandscapeOrientation() {
  if (typeof window === 'undefined') return false;

  try {
    // 1. Direct orientation lock attempt if available
    if (screen?.orientation?.lock) {
      try {
        await screen.orientation.lock('landscape');
        return true;
      } catch (directErr) {
        // Many mobile browsers (e.g. Chrome on Android) require fullscreen before locking orientation
        if (document.documentElement && typeof document.documentElement.requestFullscreen === 'function') {
          try {
            if (!document.fullscreenElement) {
              await document.documentElement.requestFullscreen();
            }
            if (screen?.orientation?.lock) {
              await screen.orientation.lock('landscape');
              return true;
            }
          } catch (fsErr) {
            console.warn('Orientation lock with fullscreen fallback failed:', fsErr);
          }
        }
      }
    }
  } catch (err) {
    console.warn('Screen orientation lock is not supported or was rejected:', err);
  }

  return false;
}

export function unlockOrientation() {
  try {
    if (screen?.orientation?.unlock) {
      screen.orientation.unlock();
    }
  } catch (err) {
    void err;
  }
}
