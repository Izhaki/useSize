import type { SizeDetector } from '../types';
import { noRegulator } from '../regulators';
import getElementSize from '../utils/getElementSize';

const isClient = typeof window !== 'undefined';

export default function createDetector({
  regulator = noRegulator,
} = {}): SizeDetector {
  if (isClient && !window.ResizeObserver) {
    throw new Error('window.ResizeObserver is not available');
  }

  let observer;

  return (element, onSize) => {
    const regulatedOnSize = regulator(onSize);

    if (!observer) {
      observer = new ResizeObserver((entries) => {
        const resizedElement = entries[0].target;
        const size = getElementSize(resizedElement);
        regulatedOnSize(size);
      });
    }

    observer.observe(element);

    return () => {
      regulatedOnSize.cancel();
      observer.unobserve(element);
    };
  };
}
