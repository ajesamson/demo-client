import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserResponseDto } from '../dto/user-response.dto';
import { KarmaEntity } from '../entities/karma.entity';

export const createUserDtoStub: CreateUserDto = {
  email: 't@m.com',
  password: 'xyz',
  confirm_password: 'xyz',
  fullname: 'john doe',
  mobile: '+2341111111111',
};

export const updateUserDtoStub: UpdateUserDto = {
  password: 'Password1',
  confirm_password: 'Password1',
  fullname: 'Simon doe',
};

export const userResponseDtoStub: UserResponseDto[] = [
  {
    id: 'b85c677c-6002-11f0-8b66-8a69e5abb4d4',
    email: 't@m.com',
    fullname: 'john doe',
    mobile: '+2341111111111',
  },
  {
    id: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
    email: 'met@meat.com',
    fullname: 'John bamidele',
    mobile: '+2341234567892',
  },
  {
    id: '06c3321e-616d-11f0-8b66-8a69e5abb4d4',
    email: 'temi@mail.com',
    fullname: 'Temi Doe',
    mobile: '+2341200567890',
  },
  {
    id: '7e31546f-61c0-11f0-8b66-8a69e5abb4d4',
    email: 'tool@tip.com',
    fullname: 'Jump pass',
    mobile: '+2349034567890',
  },
];

export const badKarmaResponse = {
  data: {
    status: 'success',
    meta: {},
    message: '',
    data: { karma_identity: 'abc' },
  } as KarmaEntity,
};

export const goodKarmaResponse = {
  data: {
    'mock-response': '',
    status: 'success',
    meta: {},
    message: '',
    data: { karma_identity: null },
  } as KarmaEntity,
};

export const userStud = {
  id: 1,
  uid: 'f0e56007-6036-11f0-8b66-8a69e5abb4d4',
  email: 'met@meat.com',
  fullname: 'John bamidele',
  mobile: '+2341234567892',
  password_hash: 'pass',
  is_active: true,
  is_onboarded: true,
  created_at: Date.now(),
  updated_at: Date.now(),
};
