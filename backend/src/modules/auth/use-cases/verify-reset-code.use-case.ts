import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface VerifyResetCodeInput {
  email: string;
  code: string;
}

@Injectable()
export class VerifyResetCodeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: VerifyResetCodeInput) {
    const email = input.email.trim().toLowerCase();
    const valid = this.userRepository.verifyResetPasswordCode(email, input.code);

    if (!valid) {
      throw new UnauthorizedException({
        error: 'Código inválido ou expirado.',
      });
    }

    return { message: 'Código verificado com sucesso.' };
  }
}
