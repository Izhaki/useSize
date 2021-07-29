import type { SizeDetector } from '../types';
import { noRegulator } from '../regulators';

const isClient = typeof window !== 'undefined';

export default function createDetector({
  regulator = noRegulator,
} = {}): SizeDetector {
  if (isClient && !window.ResizeObserver) {
    throw new Error('window.ResizeObserver is not available');
  }

  let observer;

  return (element, onSize) => {
    // Always notify the initial size straight away.
    const { width, height } = element.getBoundingClientRect();
    onSize({ width, height });

    // Set up the detector
    const regulatedOnSize = regulator(onSize);

    if (!observer) {
      observer = new ResizeObserver((entries) => {
        const resizedElement = entries[0].target;
        const { width, height } = resizedElement.getBoundingClientRect();
        regulatedOnSize({ width, height });
      });
    }

    observer.observe(element);

    return () => {
      regulatedOnSize.cancel();
      observer.unobserve(element);
    };
  };
}
