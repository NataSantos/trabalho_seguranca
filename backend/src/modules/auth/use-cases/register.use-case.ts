import { ConflictException, Injectable } from '@nestjs/common';
import { Inject } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface RegisterInput {
  email: string;
  password: string;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: RegisterInput) {
    const email = input.email.trim().toLowerCase();
    const existing = this.userRepository.findByEmail(email);

    if (existing) {
      throw new ConflictException({ error: 'E-mail já cadastrado.' });
    }

    const { id, code } = this.userRepository.create(email, input.password);

    return {
      id,
      message: 'Cadastro realizado! Verifique seu e-mail com o código enviado.',
      code,
    };
  }
}
