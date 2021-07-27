import * as React from 'react';
import sizeOnce from './detectors/sizeOnce';
import type { Size, SizeDetector, Unobserve } from './types';

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
  const unobserve = React.useRef<Unobserve | null>(null);
  const [size, setSize] = React.useState(defaultSize);

  const ref = React.useCallback((node) => {
    if (node !== null) {
      unobserve.current = detector(node, setSize);
    } else {
      unobserve.current();
      unobserve.current = null;
      setSize(defaultSize);
    }
  }, []);

  const mounted = unobserve.current !== null;
  return { ref, size, mounted };
}

export default useSize;
