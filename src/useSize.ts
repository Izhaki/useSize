import * as React from 'react';
import type { Size, SizeDetector, Unobserve } from './types';
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
  mounted: boolean;
} {
  const unobserve = React.useRef<Unobserve | null>(null);
  const [size, setSize] = useDeepState(defaultSize);

  const ref = React.useCallback((node) => {
    if (node !== null) {
      // Report initial size
      const { width, height } = node.getBoundingClientRect();
      setSize({ width, height });

      if (detector) {
        unobserve.current = detector(node, setSize);
      }
    } else {
      if (unobserve.current) {
        unobserve.current();
        unobserve.current = null;
      }
      setSize(defaultSize);
    }
  }, []);

  const mounted = unobserve.current !== null;
  return { ref, size, mounted };
}

export default useSize;
