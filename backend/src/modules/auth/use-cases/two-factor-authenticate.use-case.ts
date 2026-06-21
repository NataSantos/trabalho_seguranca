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
import { JwtTokenService } from '../../../common/services/jwt-token.service';
import { TwoFactorService } from '../../../common/services/two-factor.service';

export interface TwoFactorAuthenticateInput {
  userId: number;
  code: string;
}

@Injectable()
export class TwoFactorAuthenticateUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  execute(input: TwoFactorAuthenticateInput) {
    const user = this.userRepository.findById(input.userId);

    if (!user || !user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new BadRequestException({ error: '2FA não configurado.' });
    }

    if (!this.twoFactorService.verifyCode(input.code, user.twoFactorSecret)) {
      throw new UnauthorizedException({ error: 'Código 2FA inválido.' });
    }

    return {
      token: this.jwtTokenService.generateToken(user.id),
      user: {
        id: user.id,
        email: user.email,
      },
    };
  }
}
