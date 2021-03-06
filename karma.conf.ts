// tslint:disable no-console no-var-requires no-require-imports max-func-body-length

import { KarmaTypescriptConfig } from 'karma-typescript';

process.on('infrastructure_error', error => {
  console.error('infrastructure_error', error);
});

process.env.CHROME_BIN = require('puppeteer').executablePath();

const suite: any[] = [];
if (!process.env.KARMA_SUITE) {
  suite.push({
    pattern: './libs/ng-mocks/src/lib/**/*.ts',
    watched: true,
  });
  suite.push({
    pattern: './examples/**/*.ts',
    watched: true,
  });
  suite.push({
    pattern: './tests/**/*.ts',
    watched: true,
  });
} else if (process.env.KARMA_SUITE === 'perf') {
  suite.push({
    pattern: './tests-performance/**/*.ts',
    watched: true,
  });
} else {
  suite.push({
    pattern: process.env.KARMA_SUITE,
    watched: true,
  });
}

export default (config: KarmaTypescriptConfig) => {
  config.set({
    autoWatch: false,
    browsers: [process.env.IE_BIN ? 'IECi' : 'ChromeCi'],
    client: {
      clearContext: false,
      jasmine: {
        random: false,
      },
    },
    colors: true,
    coverageReporter: {
      dir: './test-reports/coverage',
      reporters: [
        {
          subdir: 'lcov',
          type: 'lcov',
        },
        {
          subdir: 'html',
          type: 'html',
        },
      ],
    },
    customLaunchers: {
      ChromeCi: {
        base: 'ChromeHeadless',
        flags: ['--headless', '--disable-gpu', '--no-sandbox', '--disable-dev-shm-usage'],
      },
      IECi: {
        base: 'IE',
        flags: ['-extoff'],
      },
    },
    files: [
      './empty.ts',
      './karma-test-shim.ts',
      {
        pattern: './libs/ng-mocks/src/index.ts',
        watched: true,
      },
      {
        pattern: './libs/ng-mocks/src/lib/**/!(*.spec|*.fixtures).ts',
        watched: true,
      },
      ...suite,
    ],
    frameworks: ['jasmine', 'karma-typescript'],
    junitReporter: {
      outputDir: require('path').join(__dirname, './test-reports'),
      outputFile: 'specs-junit.xml',
      useBrowserName: false,
    },
    karmaTypescriptConfig: {
      bundlerOptions: {
        resolve: {
          alias: {
            'jest-circus/build/state': './empty.ts',
          },
        },
      },
      coverageOptions:
        process.env.WITH_COVERAGE === undefined
          ? {
              instrumentation: false,
            }
          : {},
      tsconfig: 'tsconfig.spec.json',
    },
    logLevel: config.LOG_INFO,
    port: 9876,
    preprocessors: {
      '**/*.ts': 'karma-typescript',
      ...(process.env.WITH_COVERAGE === undefined
        ? {}
        : { 'libs/ng-mocks/src/lib/**/!(*.spec|*.fixtures).ts': 'coverage' }),
    },
    reporters: ['dots', ...(process.env.WITH_COVERAGE === undefined ? [] : ['junit', 'coverage'])],
    singleRun: true,
  });
};
