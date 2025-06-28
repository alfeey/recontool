export interface Transaction {
  transaction_reference: string;
  amount: number;
  status: string;
  date?: string;
  description?: string;
  [key: string]: any; // Allow for additional fields
}

export interface ReconciliationResult {
  matched: Array<{
    internal: Transaction;
    provider: Transaction;
    mismatches: string[];
  }>;
  internalOnly: Transaction[];
  providerOnly: Transaction[];
}

export interface FileUploadState {
  internal: File | null;
  provider: File | null;
}