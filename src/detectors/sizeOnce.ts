import type { SizeDetector } from '../types';

const sizeOnce: SizeDetector = (element, onSize) => {
  const { width, height } = element.getBoundingClientRect();
  onSize({ width, height });
  return () => {};
};

export default sizeOnce;
