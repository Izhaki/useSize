const { chromium } = require('playwright');

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

(async () => {
  let browser;
  try {
    browser = await chromium.launch({ headless: false });
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.exposeFunction('setViewportSize', (size) =>
      page.setViewportSize(size)
    );
    page.on('console', async (msg) => {
      console.log(msg);
    });

    const donePromise = new Promise((resolve, reject) => {
      page.exposeFunction('onTestRunDone', (failures) => {
        if (failures) {
          reject(`Tests done with ${failures} failures`);
        } else {
          resolve();
        }
      });
    });

    await page.goto('http://localhost:5858/tests');

    await donePromise;
  } catch (error) {
    console.log(error);
    process.exitCode = 1;
  } finally {
    await sleep(2000);
    await browser.close();
  }
})();
