export interface TransferEntity {
  id: number;
  uid: string;
  sender_wallet_id: number;
  receiver_wallet_id: number;
  amount: string;
  currency: string;
  description: string;
  status: string;
  created_at: Date;
  updated_at: Date;
}
