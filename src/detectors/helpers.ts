import type { SizeCallback, CancellableSizeCallback } from '../types';

export function noRegulator(callback: SizeCallback): CancellableSizeCallback {
  const identityFunction = (size) => callback(size);
  identityFunction.cancel = () => {};
  return identityFunction;
}
