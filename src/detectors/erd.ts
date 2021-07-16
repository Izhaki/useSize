import type { SizeDetector } from '../types';
import createResizeDetector from 'element-resize-detector';

let detector = null;

const noRegulator = (callback) => callback;

function createDetector({ regulator = noRegulator } = {}):
  | SizeDetector
  | undefined {
  // SSR Guard
  if (typeof window === 'undefined') return undefined;

  const resizeDetector = createResizeDetector({
    strategy: 'scroll',
  });

  detector = {
    observe(element, onSize) {
      const handleSize = regulator(onSize);

      resizeDetector.listenTo(element, () => {
        const { width, height } = element.getBoundingClientRect();
        handleSize({ width, height });
      });
    },
    unobserve(element) {
      resizeDetector.uninstall(element);
    },
  };
  return detector;
}

const getDetector = (options) => detector || createDetector(options);

export default getDetector;
