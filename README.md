# useSize

<p align="center">
  <a aria-label="Build" href="https://github.com/Izhaki/useSize/actions/workflows/release.yml">
    <img alt="GitHub Workflow Status" src="https://img.shields.io/github/workflow/status/Izhaki/useSize/Release?style=flat-square">
  </a>
  <a aria-label="NPM version" href="https://www.npmjs.com/package/@izhaki/use-size">
    <img alt="" src="https://img.shields.io/npm/v/@izhaki/use-size?style=flat-square">
  </a>
</p>

A react hook to obtain DOM elements' size.

Ultimately, a compositional take on [react-sizeme](https://github.com/ctrlplusb/react-sizeme), barring components ([why?](#why-no-components)).

Features:

- Resize detectors:
  - ResizeObserver ([browser support](https://caniuse.com/resizeobserver))
  - [ERD](https://github.com/wnr/element-resize-detector)
- Regulators:
  - Throttle
  - Debounce

## Install

```shell
npm install @izhaki/use-size
```

## Usage

### Size Once

Will only size the component upon mount.

```typescript
import useSize from '@izhaki/use-size';

function SizeOnce() {
  const { ref, size } = useSize();
  return <div ref={ref} />;
}
```

### With ResizeObserver

Use the native ResizeObserver as a resize detector.

```typescript
import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';

function ResizeObserver() {
  const { ref, size } = useSize({
    detector: resizeObserver(),
  });
  return <div ref={ref} />;
}
```

### With Throttle

```typescript
import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';
import { throttle } from '@izhaki/use-size/regulators';

function ResizeObserverWithThrottle() {
  const { ref, size } = useSize({
    detector: resizeObserver({ regulator: throttle(100) }),
  });
  return <div ref={ref} />;
}
```

### With Debounce

```typescript
import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';
import { debounce } from '@izhaki/use-size/regulators';

function ResizeObserverWithDebounce() {
  const { ref, size } = useSize({
    detector: resizeObserver({ regulator: debounce(100) }),
  });
  return <div ref={ref} />;
}
```

> ⚠️ Prefer throttle over debounce, unless your view takes a noticeable time to render (say, 15000 SVG nodes or somesuch).

### Using ERD

```typescript
import useSize from '@izhaki/use-size';
import erd from '@izhaki/use-size/detectors/erd';
import { throttle } from '@izhaki/use-size/regulators';

function ErdWithThrottle() {
  const { ref, size } = useSize({
    detector: erd({ regulator: throttle(100) }),
  });
  return <div ref={ref} />;
}
```

## Why no Components?

Components add to the API surface, specifically as there are rather few scenarios to cover:

- Do we add an element to the DOM? Which one? How will it be styled?
- Do we Forward Ref?
- Do we support render props?
- What about High Order Components?

Writing all of these components with `useSize` is cheap (a few lines of code), and each component can be tailored to specific needs.

<details>
  <summary>Example of a component that adds a div to the DOM</summary>

```javascript
import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';
import { throttle } from '@izhaki/use-size/regulators';

function Sizer({ children }) {
  const { ref, size } = useSize({
    detector: resizeObserver({ regulator: throttle(100) }),
  });
  return <div ref={ref}>{children}</div>;
}
```

</details>
