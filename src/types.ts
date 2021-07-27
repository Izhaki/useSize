export interface Size {
  width: number;
  height: number;
}

export type SizeCallback = (size: Size) => void;

type Cancellable = {
  cancel: () => void;
};

export type CancellableSizeCallback = SizeCallback & Cancellable;

export type Unobserve = () => void;

export type SizeDetector = (
  element: Element,
  onSize: SizeCallback
) => Unobserve;

export type Regulator = (
  delay: number
) => (callback: SizeCallback) => CancellableSizeCallback;
