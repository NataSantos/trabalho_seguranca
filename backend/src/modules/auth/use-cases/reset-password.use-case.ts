import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import bcrypt from 'bcryptjs';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface ResetPasswordInput {
  email: string;
  code: string;
  newPassword: string;
}

@Injectable()
export class ResetPasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: ResetPasswordInput) {
    const email = input.email.trim().toLowerCase();
    const valid = this.userRepository.verifyResetPasswordCode(email, input.code);

    if (!valid) {
      throw new UnauthorizedException({
        error: 'Código inválido ou expirado.',
      });
    }

    const user = this.userRepository.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException({ error: 'Usuário não encontrado.' });
    }

    const hashedPassword = bcrypt.hashSync(input.newPassword, 10);
    this.userRepository.updatePassword(user.id, hashedPassword);

    return { message: 'Senha redefinida com sucesso.' };
  }
}
