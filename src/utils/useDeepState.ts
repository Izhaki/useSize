import * as React from 'react';

const { stringify } = JSON;

const deepEqual = (a, b) => stringify(a) === stringify(b);

// Only sets a new state if the new value is not deeply equal to the current value.
export default function useDeepState(initialValue) {
  const [value, setValue] = React.useState(initialValue);
  const oldValue = React.useRef(initialValue);

  const setDeepValue = React.useCallback((newValue) => {
    if (!deepEqual(oldValue.current, newValue)) {
      setValue(newValue);
      oldValue.current = newValue;
    }
  }, []);

  return [value, setDeepValue];
}
