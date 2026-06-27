import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';
import crypto from 'node:crypto';

export interface ForgotPasswordInput {
  email: string;
}

@Injectable()
export class ForgotPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: ForgotPasswordInput) {
    const email = input.email.trim().toLowerCase();
    const user = this.userRepository.findByEmail(email);

    if (!user) {
      throw new NotFoundException({ error: 'E-mail não encontrado.' });
    }

    const code = crypto.randomInt(100000, 999999).toString();
    const expiresAt = Date.now() + 30 * 60 * 1000; // 30 minutes

    this.userRepository.setResetPasswordCode(email, code, expiresAt);

    return {
      message:
        'Código de recuperação enviado para o e-mail informado.',
    };
  }
}
