import type { SizeDetector, CancellableSizeCallback } from '../types';
import { noRegulator, getNotifySize } from './helpers';

function createDetector({ regulator = noRegulator } = {}):
  | SizeDetector
  | undefined {
  // SSR Guard
  if (typeof window === 'undefined') return undefined;

  if (!window.ResizeObserver) {
    throw new Error('window.ResizeObserver not avail');
  }

  let regulatedOnSize: CancellableSizeCallback;

  const notifySize = getNotifySize();

  const observer = new ResizeObserver((entries) => {
    const element = entries[0].target;
    notifySize(element, regulatedOnSize);
  });

  return (element, onSize) => {
    // Always notify the initial size straight away.
    notifySize(element, onSize);

    // Set up the detector
    regulatedOnSize = regulator(onSize);
    observer.observe(element);

    return () => {
      regulatedOnSize.cancel();
      observer.unobserve(element);
    };
  };
}

export default createDetector;
