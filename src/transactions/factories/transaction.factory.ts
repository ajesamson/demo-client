import { UserTokenEntity } from 'src/auth/entities/user-token.entity';
import { CreateTransactionDto } from '../dto/create-transaction.dto';
import { TransactionTypesEnum } from 'src/common/enums/transaction-types.enum';
import { TransactionResponseDto } from '../dto/transaction-response.dto';
import { UpdateTransactionDto } from '../dto/update-transaction.dto';
import { WalletUserEntity } from 'src/wallets/entities/wallet-user.entity';

export const userTokenStub: UserTokenEntity = {
  user: {
    sub: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
    email: 'user@mail.com',
    iat: 1,
    exp: 2,
  },
};

export const debitSenderTransactionStub: CreateTransactionDto = {
  wallet_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  type: TransactionTypesEnum.DEBIT,
  amount: '50.00',
  description: '',
  reference: '',
};

export const createCreditTransactionStub: CreateTransactionDto = {
  wallet_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  type: TransactionTypesEnum.CREDIT,
  amount: '200.00',
  receiver_wallet_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  description: '',
  reference: '',
};

export const creditSenderTransactionStub: CreateTransactionDto = {
  wallet_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  type: TransactionTypesEnum.CREDIT,
  amount: '200.00',
  description: '',
  reference: '',
};

export const createTransactionTransferStub: CreateTransactionDto = {
  wallet_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  type: TransactionTypesEnum.DEBIT,
  amount: '200.00',
  receiver_wallet_id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  description: '',
  reference: '',
};

export const updateTransactionStub: UpdateTransactionDto = {
  reference: 'REF-01',
};

export const transactionResponseDtoStub: TransactionResponseDto[] = [
  {
    id: '84de9e09-60fb-11f0-8b66-8a69e5abb4d4',
    type: 'debit',
    amount: '100.00',
    description: 'Investing in stocks',
    reference: '',
    transfer_id: '84dd697c-60fb-11f0-8b66-8a69e5abb4d4',
  },
  {
    id: '84dea325-60fb-11f0-8b66-8a69e5abb4d4',
    type: 'credit',
    amount: '100.00',
    description: 'Investing in stocks',
    reference: '',
    transfer_id: '84dd697c-60fb-11f0-8b66-8a69e5abb4d4',
  },
  {
    id: '42b5e9eb-60fc-11f0-8b66-8a69e5abb4d4',
    type: 'debit',
    amount: '50.00',
    description: '',
    reference: '',
    transfer_id: '',
  },
  {
    id: '42b5ef00-60fc-11f0-8b66-8a69e5abb4d4',
    type: 'credit',
    amount: '50.00',
    description: 'Investing in stocks',
    reference: '',
    transfer_id: '42b557c5-60fc-11f0-8b66-8a69e5abb4d4',
  },
];

export const transactionTransferStub = {
  id: '42b5ef00-60fc-11f0-8b66-8a69e5abb4d4',
  amount: '100.00',
  description: 'Investing in stocks',
  reference: '',
  transfer_id: '84dd697c-60fb-11f0-8b66-8a69e5abb4d4',
  transfer: {},
};

export const senderWalletStub = {
  id: 1,
  uid: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  currency: 'NGN',
  balance: '0',
  isWalletActive: true,
  isUserActive: true,
  isUserOnboarded: true,
} as WalletUserEntity;

export const receiverWalletStub = {
  id: 2,
  uid: 'f0e56007-6036-11f0-8c99-8a69e5abb4d4',
  currency: 'NGN',
  balance: '0',
  isWalletActive: true,
  isUserActive: true,
  isUserOnboarded: true,
} as WalletUserEntity;
