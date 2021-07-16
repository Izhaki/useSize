import Head from 'next/head';
import styles from '../styles/Home.module.css';
import useSize from '@izhaki/use-size';
import resizeObserver from '@izhaki/use-size/detectors/resizeObserver';
import { debounce, throttle } from '@izhaki/use-size/regulators';

function SizeOnce() {
  const { ref, size } = useSize();
  return (
    <div ref={ref} className={styles['size-once-example']}>
      {size.width}
    </div>
  );
}

function ResizeObserver() {
  const { ref, size } = useSize({
    //detector: resizeObserver({ regulator: debounce(100) }),
    detector: resizeObserver(),
  });
  return (
    <div ref={ref} className={styles['size-once-example']}>
      {size.width}
    </div>
  );
}

function ResizeObserverWithDebounce() {
  const { ref, size } = useSize({
    detector: resizeObserver({ regulator: debounce(250) }),
  });
  return (
    <div ref={ref} className={styles['size-once-example']}>
      {size.width}
    </div>
  );
}

function ResizeObserverWithThrottle() {
  const { ref, size } = useSize({
    detector: resizeObserver({ regulator: throttle(250) }),
  });
  return (
    <div ref={ref} className={styles['size-once-example']}>
      {size.width}
    </div>
  );
}

export default function Home() {
  return (
    <div className={styles.container}>
      <Head>
        <title>useSize Demo</title>
        <meta name="description" content="useSize Demo" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <SizeOnce />
        <ResizeObserver />
        <ResizeObserverWithDebounce />
        <ResizeObserverWithThrottle />
      </main>
    </div>
  );
}
