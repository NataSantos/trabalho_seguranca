import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface VerifyEmailInput {
  email: string;
  code: string;
}

@Injectable()
export class VerifyEmailUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: VerifyEmailInput) {
    const ok = this.userRepository.verifyEmail(
      input.email.trim().toLowerCase(),
      input.code,
    );

    if (!ok) {
      throw new BadRequestException({
        error: 'Código de verificação inválido ou expirado.',
      });
    }

    return { message: 'E-mail verificado com sucesso!' };
  }
}
