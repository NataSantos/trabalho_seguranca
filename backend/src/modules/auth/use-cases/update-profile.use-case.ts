import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface UpdateProfileInput {
  userId: number;
  name: string;
}

@Injectable()
export class UpdateProfileUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  execute(input: UpdateProfileInput) {
    const user = this.userRepository.findById(input.userId);

    if (!user) {
      throw new UnauthorizedException({ error: 'Usuário não encontrado.' });
    }

    this.userRepository.updateProfile(input.userId, input.name.trim());

    return { message: 'Perfil atualizado com sucesso.' };
  }
}
