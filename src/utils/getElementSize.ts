import type { Size } from '../types';

export default function getElementSize(element: Element): Size {
  const { width, height } = element.getBoundingClientRect();
  return { width, height };
}
