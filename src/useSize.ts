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
} {
  const [size, setSize] = useDeepState(defaultSize);

  const ref = React.useCallback((node) => {
    let unobserve: Unobserve;
    if (node !== null) {
      // Report initial size
      const { width, height } = node.getBoundingClientRect();
      setSize({ width, height });

      if (detector) {
        unobserve = detector(node, setSize);
      }
    } else {
      if (unobserve) {
        unobserve();
        unobserve = null;
      }
    }
  }, []);

  return { ref, size };
}

export default useSize;
