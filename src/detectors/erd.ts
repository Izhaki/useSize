import type { SizeDetector } from '../types';
import createResizeDetector from 'element-resize-detector';
import { noRegulator, getNotifySize } from './helpers';

let detector = null;

function createDetector({ regulator = noRegulator } = {}):
  | SizeDetector
  | undefined {
  // SSR Guard
  if (typeof window === 'undefined') return undefined;

  const resizeDetector = createResizeDetector({
    strategy: 'scroll',
  });

  const notifySize = getNotifySize();

  return {
    observe(element, onSize) {
      // Always notify the initial size straight away.
      notifySize(element, onSize);

      // Set up the detector
      const regulatedOnSize = regulator(onSize);
      resizeDetector.listenTo(element, () => {
        notifySize(element, regulatedOnSize);
      });
    },
    unobserve(element) {
      resizeDetector.uninstall(element);
    },
  };
}

const getDetector = (options = {}) => detector || createDetector(options);

export default getDetector;
