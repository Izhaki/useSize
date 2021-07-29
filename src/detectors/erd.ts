import type { SizeDetector } from '../types';
import createResizeDetector from 'element-resize-detector';
import { noRegulator } from '../regulators';

export default function createDetector({
  regulator = noRegulator,
} = {}): SizeDetector {
  let detector;

  return (element, onSize) => {
    // Always notify the initial size straight away.
    const { width, height } = element.getBoundingClientRect();
    onSize({ width, height });

    // Set up the detector
    const regulatedOnSize = regulator(onSize);

    if (!detector) {
      detector = createResizeDetector({
        strategy: 'scroll',
      });
    }

    detector.listenTo(element, () => {
      const { width, height } = element.getBoundingClientRect();
      regulatedOnSize({ width, height });
    });

    return () => {
      regulatedOnSize.cancel();
      detector.uninstall(element);
    };
  };
}
