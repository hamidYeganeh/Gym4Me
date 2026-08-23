import { ConflictException } from '@nestjs/common';
import { Types } from 'mongoose';
import { LedgerAccount, WalletOwnerType } from '../common/enums';
import type { LedgerLine } from '../schemas/ledger-entry.schema';

/**
 * Reverse captured revenue/payable credits proportionally and credit the
 * payer's wallet. Largest-remainder allocation keeps every refund balanced
 * to the Toman, including partial refunds with non-divisible splits.
 */
export function buildWalletRefundLines(
  originalLines: LedgerLine[],
  amount: number,
  paidAmount: number,
  payerUserId: Types.ObjectId,
): LedgerLine[] {
  const credits = originalLines.filter((line) => line.credit > 0);
  const creditTotal = credits.reduce((sum, line) => sum + line.credit, 0);
  if (creditTotal !== paidAmount) {
    throw new ConflictException(
      'Payment ledger does not match the captured amount',
    );
  }
  const allocations = credits.map((line, index) => {
    const exact = (line.credit * amount) / creditTotal;
    return { line, index, value: Math.floor(exact), fraction: exact % 1 };
  });
  let remainder = amount - allocations.reduce((sum, row) => sum + row.value, 0);
  for (const row of [...allocations].sort(
    (a, b) => b.fraction - a.fraction || a.index - b.index,
  )) {
    if (remainder <= 0) break;
    row.value += 1;
    remainder -= 1;
  }
  const lines: LedgerLine[] = allocations
    .filter((row) => row.value > 0)
    .map((row) => ({
      account: row.line.account,
      debit: row.value,
      credit: 0,
      party: row.line.party,
    }));
  lines.push({
    account: LedgerAccount.WALLET_LIABILITY,
    debit: 0,
    credit: amount,
    party: { type: WalletOwnerType.USER, id: payerUserId },
  });
  return lines;
}
