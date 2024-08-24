const nycConfig = {
  all: false,
  'check-coverage': false,
  reporter: ['lcov', 'text'],
  'report-dir': 'nyc-report',
  'temp-dir': 'nyc-tmp',
};

module.exports = nycConfig;
