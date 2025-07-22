export interface WalletUserEntity {
  id: number;
  uid: string;
  currency: string;
  balance: string;
  userId: string;
  isWalletActive: boolean;
  isUserActive: boolean;
  isUserOnboarded: boolean;
}
