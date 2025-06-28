import type { Transaction, ReconciliationResult } from '../types/Transaction';

export const reconcileTransactions = (
  internalTransactions: Transaction[],
  providerTransactions: Transaction[]
): ReconciliationResult => {
  const result: ReconciliationResult = {
    matched: [],
    internalOnly: [],
    providerOnly: [],
  };

  const providerMap = new Map<string, Transaction>();
  providerTransactions.forEach(transaction => {
    providerMap.set(transaction.transaction_reference, transaction);
  });

  const internalMap = new Map<string, Transaction>();
  internalTransactions.forEach(transaction => {
    internalMap.set(transaction.transaction_reference, transaction);
  });

  // Find matches and internal-only transactions
  internalTransactions.forEach(internalTx => {
    const providerTx = providerMap.get(internalTx.transaction_reference);
    
    if (providerTx) {
      // Found a match, check for mismatches
      const mismatches: string[] = [];
      
      if (Math.abs(internalTx.amount - providerTx.amount) > 0.01) {
        mismatches.push(`Amount: Internal ${internalTx.amount} vs Provider ${providerTx.amount}`);
      }
      
      if (internalTx.status.toLowerCase() !== providerTx.status.toLowerCase()) {
        mismatches.push(`Status: Internal "${internalTx.status}" vs Provider "${providerTx.status}"`);
      }

      result.matched.push({
        internal: internalTx,
        provider: providerTx,
        mismatches,
      });
    } else {
      result.internalOnly.push(internalTx);
    }
  });

  // Find provider-only transactions
  providerTransactions.forEach(providerTx => {
    if (!internalMap.has(providerTx.transaction_reference)) {
      result.providerOnly.push(providerTx);
    }
  });

  return result;
};