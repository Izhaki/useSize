import createResizeDetector from 'element-resize-detector';
import type { SizeDetector } from '../types';
import getElementSize from '../utils/getElementSize';
import { noRegulator } from '../regulators';

export default function createDetector({
  regulator = noRegulator,
} = {}): SizeDetector {
  let detector;

  return (element, onSize) => {
    // Set up the detector
    const regulatedOnSize = regulator(onSize);

    if (!detector) {
      detector = createResizeDetector({
        strategy: 'scroll',
      });
    }

    detector.listenTo(element, () => {
      const size = getElementSize(element);
      regulatedOnSize(size);
    });

    return () => {
      regulatedOnSize.cancel();
      detector.uninstall(element);
    };
  };
}
