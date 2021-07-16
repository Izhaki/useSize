import * as React from 'react';
import sizeOnce from './detectors/sizeOnce';
import type { Size, SizeDetector } from './types';

export interface Props {
  defaultSize?: Size;
  detector?: SizeDetector;
}

function useSize({
  defaultSize = { width: 0, height: 0 },
  detector = sizeOnce,
}: Props = {}): {
  ref: (node: Element | null) => void;
  size: Size;
  mounted: boolean;
} {
  const element = React.useRef<Element | null>(null);
  const [size, setSize] = React.useState(defaultSize);

  const ref = React.useCallback((node) => {
    if (node !== null) {
      element.current = node;
      detector.observe(node, setSize);
    } else if (element.current !== null) {
      detector.unobserve(element.current);
      element.current = null;
      setSize(defaultSize);
    } else {
      // We should never get here.
      throw new Error(
        'A callbackRef received null as a node (unmount), but no current element (from mount)'
      );
    }
  }, []);

  const mounted = element !== null;
  return { ref, size, mounted };
}

export default useSize;
