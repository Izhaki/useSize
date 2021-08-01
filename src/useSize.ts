import * as React from 'react';
import type { Size, SizeDetector, Unobserve } from './types';
import getElementSize from './utils/getElementSize';
import useDeepState from './utils/useDeepState';

export interface Props {
  defaultSize?: Size;
  detector?: SizeDetector;
}

function useSize({
  defaultSize = { width: 0, height: 0 },
  detector,
}: Props = {}): {
  ref: (node: Element | null) => void;
  size: Size;
} {
  const [size, setSize] = useDeepState(defaultSize);
  const unobserve = React.useRef<Unobserve | null>(null);

  const ref = React.useCallback((node) => {
    if (node !== null) {
      // Report initial size
      const size = getElementSize(node);
      setSize(size);

      if (detector) {
        unobserve.current = detector(node, setSize);
      }
    } else {
      if (unobserve.current) {
        unobserve.current();
        unobserve.current = null;
      }
    }
  }, []);

  return { ref, size };
}

export default useSize;
