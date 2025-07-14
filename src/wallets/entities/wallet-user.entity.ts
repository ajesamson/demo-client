export interface WalletUser {
  id: number;
  uid: string;
  currency: string;
  isWalletActive: boolean;
  isUserActive: boolean;
  isUserOnboarded: boolean;
}
