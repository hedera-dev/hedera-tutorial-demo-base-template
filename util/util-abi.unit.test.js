const tape = require('tape');
const { getAbiSummary } = require('./util.js');

// Test cases for ABI Handling group
tape('should return abi summary for a valid ABI', (t) => {
  const abi = [
    { type: 'function', name: 'transfer' },
    { type: 'constructor', name: 'constructor' },
    { type: 'event', name: 'Transfer' },
  ];

  const expectedSummary =
    'function (1): transfer\nconstructor (1): constructor\nevent (1): Transfer';

  const result = getAbiSummary(abi);

  t.equal(result, expectedSummary, 'ABI summary should match expected output');
  t.end();
});

tape('should return abi summary with unnamed items', (t) => {
  const abi = [
    { type: 'function' },
    { type: 'constructor' },
    { type: 'event', name: 'Transfer' },
  ];

  const expectedSummary =
    'function (1): (unnamed)\nconstructor (1): (unnamed)\nevent (1): Transfer';

  const result = getAbiSummary(abi);

  t.equal(result, expectedSummary, 'ABI summary should include unnamed items');
  t.end();
});

tape('should handle empty abi array', (t) => {
  const abi = [];

  const expectedSummary = '';

  const result = getAbiSummary(abi);

  t.equal(
    result,
    expectedSummary,
    'ABI summary for empty array should be an empty string',
  );
  t.end();
});
