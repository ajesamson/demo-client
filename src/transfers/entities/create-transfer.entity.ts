export interface CreateTransferEntity {
  sender_wallet_id: number;
  receiver_wallet_id: number;
  amount: string;
  currency: string;
  description: string;
}
