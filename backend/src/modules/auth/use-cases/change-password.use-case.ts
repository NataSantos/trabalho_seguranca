import {
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';

export interface ChangePasswordInput {
  userId: number;
  currentPassword: string;
  newPassword: string;
}

@Injectable()
export class ChangePasswordUseCase {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: UserRepository,
  ) {}

  async execute(input: ChangePasswordInput) {
    const user = this.userRepository.findById(input.userId);

    if (!user) {
      throw new UnauthorizedException({ error: 'Usuário não encontrado.' });
    }

    const passwordValid = await bcrypt.compare(
      input.currentPassword,
      user.password,
    );
    if (!passwordValid) {
      throw new UnauthorizedException({ error: 'Senha atual inválida.' });
    }

    const hashedPassword = bcrypt.hashSync(input.newPassword, 10);
    this.userRepository.updatePassword(input.userId, hashedPassword);

    return { message: 'Senha alterada com sucesso.' };
  }
}
