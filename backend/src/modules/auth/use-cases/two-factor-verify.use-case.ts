import {
  BadRequestException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';
import { TwoFactorService } from '../../../common/services/two-factor.service';

export interface TwoFactorVerifyInput {
  userId: number;
  code: string;
}

@Injectable()
export class TwoFactorVerifyUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  execute(input: TwoFactorVerifyInput) {
    const user = this.userRepository.findById(input.userId);

    if (!user || !user.twoFactorSecret) {
      throw new BadRequestException({
        error: '2FA não iniciado. Faça o setup primeiro.',
      });
    }

    if (!this.twoFactorService.verifyCode(input.code, user.twoFactorSecret)) {
      throw new UnauthorizedException({
        error: 'Código inválido. Tente novamente.',
      });
    }

    this.userRepository.enableTwoFactor(user.id);

    return { message: '2FA ativado com sucesso!' };
  }
}
