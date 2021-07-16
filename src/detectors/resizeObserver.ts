import type { SizeDetector, SizeCallback } from '../types';

const noRegulator = (callback: SizeCallback) => callback;

function createDetector({ regulator = noRegulator } = {}):
  | SizeDetector
  | undefined {
  // SSR Guard
  if (typeof window === 'undefined') return undefined;

  if (!window.ResizeObserver) {
    throw new Error('window.ResizeObserver not avail');
  }

  let regulatedOnsize: SizeCallback;

  const previousSize = { width: null, height: null };

  function notifySize(element: Element, sizeCallback) {
    const { width, height } = element.getBoundingClientRect();
    if (previousSize.width !== width || previousSize.height !== height) {
      sizeCallback({ width, height });
      previousSize.width = width;
      previousSize.height = height;
    }
  }

  const observer = new ResizeObserver((entries) => {
    const element = entries[0].target;
    notifySize(element, regulatedOnsize);
  });

  return {
    observe(element, onSize) {
      notifySize(element, onSize);
      regulatedOnsize = regulator(onSize);
      observer.observe(element);
    },
    unobserve(element) {
      observer.unobserve(element);
    },
  };
}

export default createDetector;
