import type { Regulator, SizeCallback, CancellableSizeCallback } from './types';

export function noRegulator(callback: SizeCallback): CancellableSizeCallback {
  const identityFunction = (size) => callback(size);
  identityFunction.cancel = () => {};
  return identityFunction;
}

export const debounce: Regulator = (wait: number) => (func) => {
  let timeout;
  function debounced(...args) {
    const later = () => {
      func.apply(this, args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  }

  debounced.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

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
      timeout = setTimeout(() => {
        latest();
        timeout = null;
      }, getDurationToNextFrame());
    }
  }

  throttled.cancel = () => {
    if (timeout) {
      clearTimeout(timeout);
    }
  };

  return throttled;
};
