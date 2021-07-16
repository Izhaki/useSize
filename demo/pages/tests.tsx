import * as React from 'react';
import Head from 'next/head';
import Script from 'next/script';

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

    mocha.run((failures) => {
      window.onTestRunDone(failures);
    });
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
