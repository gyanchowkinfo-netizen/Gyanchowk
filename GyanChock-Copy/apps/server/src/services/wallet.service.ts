import mongoose from 'mongoose';
import { WalletModel, WalletTransactionModel } from '../models/index.js';
import { badRequest, conflict } from '../utils/errors.js';
import type { WalletTxType } from '@gyan-chowk/shared';

export async function getOrCreateWallet(userId: string) {
  const existing = await WalletModel.findOne({ user: userId });
  if (existing) return existing;
  return WalletModel.create({ user: userId });
}

export async function applyWalletTx(input: {
  userId: string;
  type: WalletTxType;
  amountPaise: number;
  reference?: string;
  idempotencyKey?: string;
  meta?: unknown;
  session?: mongoose.ClientSession;
}) {
  if (input.amountPaise <= 0) throw badRequest('Amount must be positive');
  if (input.idempotencyKey) {
    const dup = await WalletTransactionModel.findOne({ idempotencyKey: input.idempotencyKey });
    if (dup) return dup;
  }

  const credit = input.type.startsWith('credit_');
  const wallet = await getOrCreateWallet(input.userId);
  const next = credit ? wallet.balancePaise + input.amountPaise : wallet.balancePaise - input.amountPaise;
  if (next < 0) throw badRequest('Insufficient wallet balance');

  try {
    const tx = await WalletTransactionModel.create(
      [
        {
          wallet: wallet._id,
          user: input.userId,
          type: input.type,
          amountPaise: input.amountPaise,
          balanceAfterPaise: next,
          reference: input.reference,
          idempotencyKey: input.idempotencyKey,
          meta: input.meta,
        },
      ],
      { session: input.session },
    );
    wallet.balancePaise = next;
    if (input.type === 'credit_cashback') wallet.cashbackPaise += input.amountPaise;
    if (input.type === 'credit_referral') wallet.referralPaise += input.amountPaise;
    if (input.type === 'credit_promo') wallet.promoPaise += input.amountPaise;
    await wallet.save({ session: input.session });
    return tx[0];
  } catch (err) {
    if (err && typeof err === 'object' && 'code' in err && (err as { code: number }).code === 11000) {
      throw conflict('Duplicate wallet transaction');
    }
    throw err;
  }
}
