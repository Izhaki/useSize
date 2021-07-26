import type { SizeCallback } from '../types';

export const noRegulator = (callback: SizeCallback) => callback;

export function getNotifySize() {
  const previousSize = { width: null, height: null };

  return function notifySize(element: Element, sizeCallback) {
    const { width, height } = element.getBoundingClientRect();
    if (previousSize.width !== width || previousSize.height !== height) {
      sizeCallback({ width, height });
      previousSize.width = width;
      previousSize.height = height;
    }
  };
}
