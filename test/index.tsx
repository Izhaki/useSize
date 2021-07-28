import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';
import erd from '@izhaki/use-size/detectors/erd';
import { debounce, throttle } from '@izhaki/use-size/regulators';
import {
  render as testingLibraryRender,
  waitFor,
} from '@testing-library/react';

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

const waitForCondition = (predicate) =>
  waitFor(() => expect(predicate()).to.be.true, { timeout: 2000 });

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

    this.getRenderCount = () => renderCount;
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

    it('should update when the component is resized', async function () {
      await this.waitForRerender(() =>
        window.setViewportSize({ width: 700, height: 700 })
      );
      const { width } = await this.getSize();
      expect(width).to.eq(700);
    });
  });

  describe('when initiated with a resizeObserver detector and a throttle regulator', function () {
    beforeEach(async function () {
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
      const initialRenderCount = this.getRenderCount();

      await window.setViewportSize({ width: 800, height: 800 });
      await sleep(100);

      await window.setViewportSize({ width: 700, height: 700 });
      await sleep(100);

      expect(this.getRenderCount()).to.eq(initialRenderCount);
    });

    it('should not update when the component is resized to the same size and the throttle duration has elapsed', async function () {
      const initialRenderCount = this.getRenderCount();

      await window.setViewportSize({ width: 800, height: 800 });
      await sleep(100);

      await window.setViewportSize({ width: 600, height: 600 });
      await sleep(200);

      expect(this.getRenderCount()).to.eq(initialRenderCount);
    });

    it('should update when the component is resized and the throttle duration has elapsed', async function () {
      await window.setViewportSize({ width: 800, height: 800 });
      await sleep(100);

      await window.setViewportSize({ width: 700, height: 700 });
      await sleep(200);

      const { width } = await this.getSize();
      expect(width).to.eq(700);
    });
  });

  describe('when initiated with a resizeObserver detector and a debounce regulator', function () {
    beforeEach(async function () {
      this.getSize = await render(
        <UseSize
          options={{
            detector: resizeObserver({ regulator: debounce(200) }),
          }}
          onRender={this.onRender}
        />
      );
    });

    it('should return the correct size', async function () {
      const { width } = await this.getSize();
      expect(width).to.eq(600);
    });

    it('should not update when the component is resized but the debounce duration has not elapsed', async function () {
      const initialRenderCount = this.getRenderCount();

      await window.setViewportSize({ width: 800, height: 800 });
      await sleep(120);

      await window.setViewportSize({ width: 700, height: 700 });
      await sleep(120);

      expect(this.getRenderCount()).to.eq(initialRenderCount);
    });

    it('should update when the component is resized and the debounce duration has elapsed', async function () {
      await window.setViewportSize({ width: 900, height: 900 });
      await sleep(100);

      await window.setViewportSize({ width: 800, height: 800 });
      await sleep(100);

      await window.setViewportSize({ width: 700, height: 700 });
      await sleep(250);

      const { width } = await this.getSize();
      expect(width).to.eq(700);
    });
  });

  describe('when initiated with an erd detector but no regulator', function () {
    beforeEach(async function () {
      this.getSize = await render(
        <UseSize
          options={{
            detector: erd(),
          }}
          onRender={this.onRender}
        />
      );
    });

    it('should return the correct size', async function () {
      const { width } = await this.getSize();
      expect(width).to.eq(600);
    });

    it('should update when the component is resized', async function () {
      await this.waitForRerender(() =>
        window.setViewportSize({ width: 700, height: 700 })
      );
      const { width } = await this.getSize();
      expect(width).to.eq(700);
    });
  });
});
