import { User } from '@prisma/client';

export type NewUserDTO = {
  username: string;
  password: string;
};

export type LoginDTO = {
  username: string;
  password: string;
};

export type CredentialResult = {
  accessToken: string;
  user: Omit<User, 'password'>;
};
