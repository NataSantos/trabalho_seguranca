import type { UserRow } from '../../../common/database/schema';

export const USER_REPOSITORY = Symbol('USER_REPOSITORY');

export interface CreateUserResult {
  id: number;
  code: string;
}

export interface UserRepository {
  findByEmail(email: string): UserRow | null;
  findById(id: number): UserRow | null;
  create(email: string, password: string): CreateUserResult;
  verifyEmail(email: string, code: string): boolean;
  setTwoFactorSecret(userId: number, secret: string): void;
  enableTwoFactor(userId: number): void;
}
