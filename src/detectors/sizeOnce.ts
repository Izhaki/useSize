import type { SizeDetector } from '../types';

const sizeOnce: SizeDetector = {
  observe(element, onSize) {
    const { width, height } = element.getBoundingClientRect();
    onSize({ width, height });
  },
  unobserve() {},
};

export default sizeOnce;
