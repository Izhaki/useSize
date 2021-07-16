import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';
import { debounce, throttle, setClock } from '@izhaki/use-size/regulators';
import {
  render as testingLibraryRender,
  waitFor,
} from '@testing-library/react';
import { createClock } from '@sinonjs/fake-timers';

const { expect } = chai;

declare global {
  interface Window {
    setViewportSize: (size: { width: number; height: number }) => Promise<void>;
  }
}

const sleep = (ms: number) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

const toInt = (str: string) => parseInt(str, 10);

const style = {
  backgroundColor: '#eee',
  padding: '1em',
};

function UseSize({ options = {}, onRender }) {
  const { ref, size } = useSize(options);
  onRender();
  return (
    <div ref={ref} style={style}>
      <span title="width">{size.width}</span>
    </div>
  );
}

const waitForCondition = (evaluator) =>
  waitFor(() => expect(evaluator()).to.be.true, { timeout: 2000 });

async function render(reactElement) {
  const { findByTitle } = testingLibraryRender(reactElement);

  async function getSize() {
    const widthEl = await findByTitle('width');
    return {
      width: toInt(widthEl.innerText),
    };
  }

  return getSize;
}

describe('The useSize hook', function () {
  beforeEach(async function () {
    await window.setViewportSize({ width: 600, height: 600 });
    let renderCount = 0;
    this.onRender = () => {
      renderCount++;
    };

    this.waitForRerender = async (callback) => {
      const oldRenderCount = renderCount;
      await callback();
      await waitForCondition(() => renderCount > oldRenderCount);
    };

    this.expectNoRerender = async (callback) => {
      const oldRenderCount = renderCount;
      await callback();
      expect(renderCount).to.eql(oldRenderCount);
    };
  });

  afterEach(async function () {
    await sleep(1500);
  });

  describe('when initiated with no detector', function () {
    beforeEach(async function () {
      this.getSize = await render(<UseSize onRender={this.onRender} />);
    });

    it('should return the correct size', async function () {
      const { width } = await this.getSize();
      expect(width).to.eq(600);
    });

    it('should not update when the component is resized', async function () {
      await window.setViewportSize({ width: 700, height: 700 });
      const { width } = await this.getSize();
      expect(width).to.eq(600);
    });
  });

  describe('when initiated with a resizeObserver detector but no regulator', function () {
    beforeEach(async function () {
      this.getSize = await render(
        <UseSize
          options={{
            detector: resizeObserver(),
          }}
          onRender={this.onRender}
        />
      );
    });

    it('should return the correct size', async function () {
      const { width } = await this.getSize();
      expect(width).to.eq(600);
    });

    it('should not update when the component is resized', async function () {
      await this.waitForRerender(() =>
        window.setViewportSize({ width: 700, height: 700 })
      );
      const { width } = await this.getSize();
      expect(width).to.eq(700);
    });
  });

  describe.only('when initiated with a resizeObserver detector and a throttle regulator', function () {
    beforeEach(async function () {
      this.clock = createClock();

      setClock(this.clock);

      this.getSize = await render(
        <UseSize
          options={{
            detector: resizeObserver({ regulator: throttle(250) }),
          }}
          onRender={this.onRender}
        />
      );
    });

    it('should return the correct size', async function () {
      const { width } = await this.getSize();
      expect(width).to.eq(600);
    });

    it('should not update when the component is resized but the throttle duration has not elapsed', async function () {
      await this.expectNoRerender(() =>
        window.setViewportSize({ width: 700, height: 700 })
      );
    });

    it.only('should update when the component is resized and the throttle duration has elapsed', async function () {
      await this.expectNoRerender(() =>
        window.setViewportSize({ width: 800, height: 800 })
      );

      await this.expectNoRerender(() =>
        window.setViewportSize({ width: 700, height: 700 })
      );

      // Setting the viewport size above will trigger the first resize event, which will call
      // setTimer for the first time, but this may happen slightly after this point in the test
      // so we wait to ensure setTimer was called.
      await waitForCondition(() => this.clock.countTimers() === 1);

      await this.waitForRerender(() => {
        this.clock.tick(300);
      });

      const { width } = await this.getSize();
      expect(width).to.eq(700);
    });
  });
});
