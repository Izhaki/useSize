import type { SizeDetector } from '../types';
import createResizeDetector from 'element-resize-detector';
import { noRegulator } from '../regulators';

let detector = null;

function createDetector({ regulator = noRegulator } = {}):
  | SizeDetector
  | undefined {
  // SSR Guard
  if (typeof window === 'undefined') return undefined;

  const resizeDetector = createResizeDetector({
    strategy: 'scroll',
  });

  return (element, onSize) => {
    // Always notify the initial size straight away.
    const { width, height } = element.getBoundingClientRect();
    onSize({ width, height });

    // Set up the detector
    const regulatedOnSize = regulator(onSize);
    resizeDetector.listenTo(element, () => {
      const { width, height } = element.getBoundingClientRect();
      regulatedOnSize({ width, height });
    });

    return () => {
      regulatedOnSize.cancel();
      resizeDetector.uninstall(element);
    };
  };
}

const getDetector = (options = {}) => detector || createDetector(options);

export default getDetector;
