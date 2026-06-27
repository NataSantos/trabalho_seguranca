import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface MeInput {
  userId: number;
}

@Injectable()
export class MeUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: MeInput) {
    const user = this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException({ error: 'Usuário não encontrado.' });
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name ?? null,
      two_factor_enabled: Boolean(user.twoFactorEnabled),
    };
  }
}
