import * as React from 'react';
import Head from 'next/head';
import Script from 'next/script';
import MochaConsoleReporter from '../lib/MochaConsoleReporter';

declare global {
  interface Window {
    onTestRunDone: (failures: number) => Promise<void>;
  }
}

export default function Tests() {
  const handleMochaReady = async () => {
    mocha.setup('bdd');
    mocha.checkLeaks();

    await import('../../test');

    const runner = mocha.run((failures) => {
      window.onTestRunDone(failures);
    });

    new MochaConsoleReporter(runner);
  };

  return (
    <>
      <Head>
        <title>useSize Tests</title>
        <meta name="description" content="useSize Tests" />
        <link rel="stylesheet" href="https://unpkg.com/mocha/mocha.css" />
      </Head>

      <Script
        src="https://unpkg.com/chai/chai.js"
        strategy="beforeInteractive"
      />
      <Script
        src="https://unpkg.com/mocha/mocha.js"
        onLoad={handleMochaReady}
      />

      <div id="mocha">Test Results</div>
    </>
  );
}
