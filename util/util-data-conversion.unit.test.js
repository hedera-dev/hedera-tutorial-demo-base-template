const tape = require('tape');
const {
  convertTransactionIdForMirrorNodeApi,
  queryAccountByEvmAddress,
  queryAccountByPrivateKey,
  isHexPrivateKey,
  calculateTransactionFeeFromViem,
} = require('./util.js');

tape(
  '[[group]] unit / util / convertTransactionIdForMirrorNodeApi',
  (testGroup) => {
    // Test: should convert transaction id for mirror node api
    testGroup.test('should convert transaction id for mirror node api', (t) => {
      const transactionId = '0.0.123@1624435347.123456789';
      const expected = '0.0.123-1624435347-123456789';

      const result = convertTransactionIdForMirrorNodeApi(transactionId);

      t.equal(result, expected, 'Transaction ID should be converted correctly');
      t.end();
    });

    // Test: should error when converting transaction id for mirror node api for invalid input
    testGroup.test(
      'should error when converting transaction id for mirror node api for invalid input',
      (t) => {
        try {
          const invalidTransactionId = 'invalid-transaction-id';
          convertTransactionIdForMirrorNodeApi(invalidTransactionId);
          t.fail('Expected error not thrown for invalid transaction ID');
        } catch (error) {
          t.pass('Error thrown as expected for invalid transaction ID');
        }
        t.end();
      },
    );
  },
);

tape('[[group]] unit / util / queryAccountByEvmAddress', (testGroup) => {
  // Test: should query account by evm address
  testGroup.test('should query account by evm address', async (t) => {
    const mockEvmAddress = '0x0000000000000000000000000000000000000000';

    // Mock `fetch`
    const mockFetch = t.capture(global, 'fetch', async () => ({
      json: async () => ({
        account: '0.0.123',
        balance: { balance: 1000 },
        evm_address: mockEvmAddress,
      }),
    }));

    const result = await queryAccountByEvmAddress(mockEvmAddress);

    const mockFetchInvocation0 = mockFetch()?.[0];

    t.equal(
      mockFetchInvocation0?.args?.[0],
      'https://testnet.mirrornode.hedera.com/api/v1/accounts/0x0000000000000000000000000000000000000000?limit=1&order=asc&transactiontype=cryptotransfer&transactions=false',
    );

    t.equal(
      result.accountId,
      '0.0.123',
      'Account ID should match the mock response',
    );
    t.equal(
      result.accountBalance,
      1000,
      'Account balance should match the mock response',
    );
    t.equal(
      result.accountEvmAddress,
      mockEvmAddress,
      'EVM address should match the mock response',
    );
    t.end();
  });

  // Test: should error when querying account by evm address and mirror node api responds with error
  testGroup.test(
    'should error when querying account by evm address and mirror node api responds with error',
    async (t) => {
      const mockEvmAddress = '0x0000000000000000000000000000000000000000';

      // Mock `fetch`
      const mockFetch = t.capture(global, 'fetch');

      const result = await queryAccountByEvmAddress(mockEvmAddress);

      const mockFetchInvocation0 = mockFetch()?.[0];

      t.equal(
        mockFetchInvocation0?.args?.[0],
        'https://testnet.mirrornode.hedera.com/api/v1/accounts/0x0000000000000000000000000000000000000000?limit=1&order=asc&transactiontype=cryptotransfer&transactions=false',
      );

      t.notOk(
        result.accountId,
        'Account ID should be undefined for invalid response',
      );
      t.notOk(
        result.accountBalance,
        'Account balance should be undefined for invalid response',
      );
      t.notOk(
        result.accountEvmAddress,
        'EVM address should be undefined for invalid response',
      );
      t.end();
    },
  );
});

tape('[[group]] unit / util / queryAccountByPrivateKey', (testGroup) => {
  // Test: should query account by private key
  testGroup.test('should query account by private key', async (t) => {
    const mockPrivateKey =
      '0x6cd0462cd96ccaaec7e5fe514a670661a2b3c886b782830e2f2cc32ccb40980c';

    // Mock `fetch`
    const mockFetch = t.capture(global, 'fetch', async () => ({
      json: async () => ({
        accounts: [
          {
            account: '0.0.456',
            balance: { balance: 2000 },
            evm_address: '0x0000000000000000000000000000000000000001',
          },
        ],
      }),
    }));

    const result = await queryAccountByPrivateKey(mockPrivateKey);

    const mockFetchInvocation0 = mockFetch()?.[0];

    t.equal(
      mockFetchInvocation0?.args?.[0],
      'https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=0x0282da859e28f46b36ea4f9068f2bb34c19923cf6de540540d148bc7288ac4d997&balance=true&limit=1&order=desc',
    );

    t.equal(
      result.accountId,
      '0.0.456',
      'Account ID should match the mock response',
    );
    t.equal(
      result.accountBalance,
      2000,
      'Account balance should match the mock response',
    );
    t.equal(
      result.accountEvmAddress,
      '0x0000000000000000000000000000000000000001',
      'EVM address should match the mock response',
    );
    t.end();
  });

  // Test: should error when querying account by private key and mirror node api responds with error
  testGroup.test(
    'should error when querying account by private key and mirror node api responds with error',
    async (t) => {
      const mockPrivateKey =
        '0x6cd0462cd96ccaaec7e5fe514a670661a2b3c886b782830e2f2cc32ccb40980c';

      // Mock `fetch`
      const mockFetch = t.capture(global, 'fetch', async () => ({
        json: async () => ({
          accounts: [],
        }),
      }));

      const result = await queryAccountByPrivateKey(mockPrivateKey);

      const mockFetchInvocation0 = mockFetch()?.[0];

      t.equal(
        mockFetchInvocation0?.args?.[0],
        'https://testnet.mirrornode.hedera.com/api/v1/accounts?account.publickey=0x0282da859e28f46b36ea4f9068f2bb34c19923cf6de540540d148bc7288ac4d997&balance=true&limit=1&order=desc',
      );

      t.notOk(
        result.accountId,
        'Account ID should be undefined for invalid response',
      );
      t.notOk(
        result.accountBalance,
        'Account balance should be undefined for invalid response',
      );
      t.notOk(
        result.accountEvmAddress,
        'EVM address should be undefined for invalid response',
      );
      t.end();
    },
  );
});

tape('[[group]] unit / util / isHexPrivateKey', (testGroup) => {
  // Test: should identify valid hex private key
  testGroup.test('should identify valid hex private key', (t) => {
    const validKey =
      '0x4bc72bb28d9ab751fef3e3d76241b5ff56b0ad2f240ac671fbaeb9f82d8545de';

    t.ok(
      isHexPrivateKey(validKey),
      'Valid hex private key should be identified correctly',
    );
    t.end();
  });

  // Test: should identify invalid hex private keys
  testGroup.test('should identify invalid hex private keys', (t) => {
    const invalidKey1 =
      '4bc72bb28d9ab751fef3e3d76241b5ff56b0ad2f240ac671fbaeb9f82d8545de';
    const invalidKey2 = '0x123';
    const invalidKey3 =
      '0xZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZZ';

    t.notOk(
      isHexPrivateKey(invalidKey1),
      'Key without "0x" prefix should be identified as invalid',
    );
    t.notOk(
      isHexPrivateKey(invalidKey2),
      'Key with too few characters should be identified as invalid',
    );
    t.notOk(
      isHexPrivateKey(invalidKey3),
      'Key with invalid characters should be identified as invalid',
    );
    t.end();
  });
});

tape('[[group]] unit / util / calculateTransactionFeeFromViem', (testGroup) => {
  // Test: should calculate transaction fee from viem receipt
  testGroup.test('should calculate transaction fee from viem receipt', (t) => {
    const receipt = {
      gasUsed: '21000',
      effectiveGasPrice: '50000000000000',
    };

    // 50,000,000,000,000 weibar = 5,000 tinybar
    // 21,000 gas * 5,000 tinybar/gas = 105,000,000 tinybar = 1.05 hbar
    const expectedFee = '1.05 ℏ';

    const result = calculateTransactionFeeFromViem(receipt);

    t.equal(
      result,
      expectedFee,
      'Transaction fee should be calculated correctly from viem receipt',
    );
    t.end();
  });
});
