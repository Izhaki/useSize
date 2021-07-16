export interface Size {
  width: number;
  height: number;
}

export type SizeCallback = (size: Size) => void;

export interface SizeDetector {
  observe: (element: Element, onSize: SizeCallback) => void;
  unobserve: (element: Element) => void;
}

export type Regulator = (
  delay: number
) => (callback: SizeCallback) => SizeCallback;
