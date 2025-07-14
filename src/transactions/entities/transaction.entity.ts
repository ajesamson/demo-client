export interface Transaction {
  id: number;
  uid: string;
  wallet_id: number;
  transfer_id: number;
  initiated_by: number;
  type: string;
  amount: string;
  description: string;
  reference: string;
  is_system_initiated: boolean;
  created_at: Date;
  updated_at: Date;
}
