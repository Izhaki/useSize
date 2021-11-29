import createResizeDetector from 'element-resize-detector';
import type { SizeDetector } from '../types';
import getElementSize from '../utils/getElementSize';
import { noRegulator } from '../regulators';

function create(onSize) {
  const detector = createResizeDetector({
    strategy: 'scroll',
  });

  return {
    observe(element) {
      detector.listenTo(element, onSize);
    },
    unobserve(element) {
      detector.uninstall(element);
    },
  };
}

export default function createDetector({
  regulator = noRegulator,
} = {}): SizeDetector {
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
