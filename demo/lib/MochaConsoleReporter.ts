// https://mochajs.org/api/tutorial-custom-reporter.html

export default class MochaConsoleReporter {
  _indents = 0;
  constructor(runner) {
    const {
      EVENT_RUN_BEGIN,
      EVENT_RUN_END,
      EVENT_TEST_FAIL,
      EVENT_TEST_PASS,
      EVENT_SUITE_BEGIN,
      EVENT_SUITE_END,
    } = Mocha.Runner.constants;

    this._indents = 0;
    const stats = runner.stats;

    runner
      .once(EVENT_RUN_BEGIN, () => {
        console.log('start');
      })
      .on(EVENT_SUITE_BEGIN, (suite) => {
        console.log(`${this.indent()}${suite.title}`);
        this.increaseIndent();
      })
      .on(EVENT_SUITE_END, () => {
        this.decreaseIndent();
      })
      .on(EVENT_TEST_PASS, (test) => {
        console.log(`${this.indent()}✓ ${test.title}`);
      })
      .on(EVENT_TEST_FAIL, (test, err) => {
        console.log(`${this.indent()}✗ ${test.title} (${err.message})`);
      })
      .once(EVENT_RUN_END, () => {
        console.log(`${stats.passes}/${stats.passes + stats.failures} passed`);
      });
  }

  indent() {
    return Array(this._indents).join('  ');
  }

  increaseIndent() {
    this._indents++;
  }

  decreaseIndent() {
    this._indents--;
  }
}
