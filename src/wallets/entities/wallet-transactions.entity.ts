export interface WalletTransactionsEntity {
  uid: string;
  balance: string;
  currency: string;
  transaction_id: string;
  type: 'credit' | 'debit';
  amount: string;
  description: string;
  created_at: Date;
}
