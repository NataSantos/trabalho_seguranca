import { Injectable } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import { eq } from 'drizzle-orm';
import { DatabaseService } from '../../../common/database/database.service';
import { users } from '../../../common/database/schema';
import {
  type CreateUserResult,
  type UserRepository,
} from '../interfaces/user-repository.interface';

@Injectable()
export class DrizzleUserRepository implements UserRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.connection;
  }

  findByEmail(email: string) {
    return (
      this.db.select().from(users).where(eq(users.email, email)).get() ?? null
    );
  }

  findById(id: number) {
    return this.db.select().from(users).where(eq(users.id, id)).get() ?? null;
  }

  create(email: string, password: string): CreateUserResult {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const code = Math.floor(100000 + Math.random() * 900000).toString();

    const result = this.db
      .insert(users)
      .values({
        email,
        password: hashedPassword,
        emailVerificationCode: code,
        emailVerificationExpires: Date.now() + 30 * 60 * 1000, // 30 minutes
      })
      .run();

    return { id: Number(result.lastInsertRowid), code };
  }

  verifyEmail(email: string, code: string) {
    const user = this.findByEmail(email);

    if (
      !user ||
      user.emailVerificationCode !== code ||
      !user.emailVerificationExpires ||
      Date.now() > user.emailVerificationExpires
    ) {
      return false;
    }

    this.db
      .update(users)
      .set({
        emailVerified: true,
        emailVerificationCode: null,
        emailVerificationExpires: null,
      })
      .where(eq(users.id, user.id))
      .run();

    return true;
  }

  incrementLoginAttempts(userId: number) {
    const user = this.findById(userId);
    if (!user) return;

    const attempts = (user.loginAttempts ?? 0) + 1;

    if (attempts >= 5) {
      this.db
        .update(users)
        .set({
          loginAttempts: attempts,
          lockedUntil: Date.now() + 15 * 60 * 1000, // 15 minutes
        })
        .where(eq(users.id, userId))
        .run();
    } else {
      this.db
        .update(users)
        .set({ loginAttempts: attempts })
        .where(eq(users.id, userId))
        .run();
    }
  }

  resetLoginAttempts(userId: number) {
    this.db
      .update(users)
      .set({ loginAttempts: 0, lockedUntil: null })
      .where(eq(users.id, userId))
      .run();
  }

  setTwoFactorSecret(userId: number, secret: string) {
    this.db
      .update(users)
      .set({ twoFactorSecret: secret })
      .where(eq(users.id, userId))
      .run();
  }

  enableTwoFactor(userId: number) {
    this.db
      .update(users)
      .set({ twoFactorEnabled: true })
      .where(eq(users.id, userId))
      .run();
  }

  setResetPasswordCode(email: string, code: string, expiresAt: number) {
    this.db
      .update(users)
      .set({ resetPasswordCode: code, resetPasswordExpires: expiresAt })
      .where(eq(users.email, email))
      .run();
  }

  verifyResetPasswordCode(email: string, code: string) {
    const user = this.findByEmail(email);
    if (
      !user ||
      user.resetPasswordCode !== code ||
      !user.resetPasswordExpires ||
      Date.now() > user.resetPasswordExpires
    ) {
      return false;
    }
    return true;
  }

  updatePassword(userId: number, hashedPassword: string) {
    this.db
      .update(users)
      .set({
        password: hashedPassword,
        resetPasswordCode: null,
        resetPasswordExpires: null,
      })
      .where(eq(users.id, userId))
      .run();
  }

  updateProfile(userId: number, name: string) {
    this.db
      .update(users)
      .set({ name })
      .where(eq(users.id, userId))
      .run();
  }
}
