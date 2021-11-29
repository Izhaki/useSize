import type { SizeDetector } from '../types';
import { noRegulator } from '../regulators';
import getElementSize from '../utils/getElementSize';

function create(onSize) {
  const detector = new ResizeObserver(() => {
    onSize();
  });

  return {
    observe(element) {
      detector.observe(element);
    },
    unobserve(element) {
      detector.unobserve(element);
    },
  };
}

const isClient = typeof window !== 'undefined';

export default function createDetector({
  regulator = noRegulator,
} = {}): SizeDetector {
  if (isClient && !window.ResizeObserver) {
    throw new Error('window.ResizeObserver is not available');
  }

  let detector;

  return (element, onSize) => {
    const regulatedOnSize = regulator(onSize);

    function handleResize() {
      const size = getElementSize(element);
      regulatedOnSize(size);
    }

    if (!detector) {
      detector = create(handleResize);
    }

    detector.observe(element);

    return () => {
      regulatedOnSize.cancel();
      detector.unobserve(element);
    };
  };
}
