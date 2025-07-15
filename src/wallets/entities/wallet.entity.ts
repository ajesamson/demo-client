export interface WalletEntity {
  id: number;
  uid: string;
  user_id: number;
  balance: string;
  currency: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
