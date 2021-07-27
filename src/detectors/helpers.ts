import type { SizeCallback, CancellableSizeCallback } from '../types';

export function noRegulator(callback: SizeCallback): CancellableSizeCallback {
  const identityFunction = (size) => callback(size);
  identityFunction.cancel = () => {};
  return identityFunction;
}

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
