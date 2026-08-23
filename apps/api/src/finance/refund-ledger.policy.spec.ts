import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LedgerAccount } from '../common/enums';
import { buildWalletRefundLines } from './refund-ledger.policy';

describe('buildWalletRefundLines', () => {
  it('allocates a partial refund exactly and balances rounding remainders', () => {
    const userId = new Types.ObjectId();
    const lines = buildWalletRefundLines(
      [
        { account: LedgerAccount.GATEWAY_CLEARING, debit: 101, credit: 0 },
        { account: LedgerAccount.PLATFORM_REVENUE, debit: 0, credit: 34 },
        { account: LedgerAccount.PROVIDER_PAYABLE, debit: 0, credit: 67 },
      ],
      50,
      101,
      userId,
    );

    expect(lines.reduce((sum, line) => sum + line.debit, 0)).toBe(50);
    expect(lines.reduce((sum, line) => sum + line.credit, 0)).toBe(50);
    expect(lines.at(-1)).toMatchObject({
      account: LedgerAccount.WALLET_LIABILITY,
      credit: 50,
      party: { id: userId },
    });
  });

  it('rejects a ledger whose credits do not equal the captured amount', () => {
    expect(() =>
      buildWalletRefundLines(
        [{ account: LedgerAccount.PLATFORM_REVENUE, debit: 0, credit: 90 }],
        40,
        100,
        new Types.ObjectId(),
      ),
    ).toThrow(ConflictException);
  });
});
