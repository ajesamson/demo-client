import { CreateWalletDto } from '../dto/create-wallet.dto';
import { UpdateWalletDto } from '../dto/update-wallet.dto';
import { WalletResponseDto } from '../dto/wallet-response.dto';

export const createWalletDtoStub: CreateWalletDto = {
  user_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
};

export const updateWalletDtoStub: UpdateWalletDto = {
  user_id: 'f0e79050-6036-11f0-8b66-8a69e5abb4d4',
};

export const walletResponseDtoStub: WalletResponseDto[] = [
  {
    id: 'f0e79050-6036-11f0-8b66-8a69e5abb4d4',
    balance: '200.00',
    currency: 'NGN',
  },
  {
    id: 'e051b46a-609a-11f0-8b66-8a69e5abb4d4',
    balance: '590.00',
    currency: 'NGN',
  },
  {
    id: '0ba3c0c4-616d-11f0-8b66-8a69e5abb4d4',
    balance: '900.00',
    currency: 'NGN',
  },
  {
    id: '7e51f4b8-61c0-11f0-8b66-8a69e5abb4d4',
    balance: '0.00',
    currency: 'NGN',
  },
];

export const walletUserStub = {
  id: 1,
  uid: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  currency: 'NGN',
  balance: '0',
  isWalletActive: true,
  isUserActive: true,
  isUserOnboarded: true,
};
