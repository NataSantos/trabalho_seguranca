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
      })
      .run();

    return { id: Number(result.lastInsertRowid), code };
  }

  verifyEmail(email: string, code: string) {
    const user = this.findByEmail(email);

    if (!user || user.emailVerificationCode !== code) {
      return false;
    }

    this.db
      .update(users)
      .set({ emailVerified: true, emailVerificationCode: null })
      .where(eq(users.id, user.id))
      .run();

    return true;
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
}
