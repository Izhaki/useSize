import type { Regulator } from './types';

let clock = {
  setTimeout: setTimeout.bind(this),
  clearTimeout: clearTimeout.bind(this),
};

// For testing
export function setClock(newClock) {
  clock = newClock;
}

export const debounce: Regulator = (wait: number) => (func) => {
  let timeout;
  function debounced(...args) {
    const later = () => {
      func.apply(this, args);
    };
    clock.clearTimeout(timeout);
    timeout = clock.setTimeout(later, wait);
  }

  return debounced;
};

const { now } = Date;

export const throttle: Regulator = (frameDuration: number) => (func) => {
  let timeout = null;
  let latest;
  const epoch = now();

  function getDurationToNextFrame() {
    const elapsed = now() - epoch;
    const durationSinceLastFrame = elapsed % frameDuration;
    return frameDuration - durationSinceLastFrame;
  }

  function throttled(...args) {
    latest = () => {
      func.apply(this, args);
    };
    if (!timeout) {
      timeout = clock.setTimeout(() => {
        latest();
        timeout = null;
      }, getDurationToNextFrame());
    }
  }

  return throttled;
};
