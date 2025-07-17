export interface TransactionTransferEntity {
  uid: string;
  type: 'credit' | 'debit';
  amount: string;
  description: string;
  reference: string;
  transfer_id: string;
  sender_wallet_id: string;
  receiver_wallet_id: string;
  transfer_amount: string;
  transfer_description: string;
}
