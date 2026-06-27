import {
  ForbiddenException,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import bcrypt from 'bcryptjs';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';
import { JwtTokenService } from '../../../common/services/jwt-token.service';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly jwtTokenService: JwtTokenService,
  ) {}

  execute(input: LoginInput) {
    const email = input.email.trim().toLowerCase();
    const user = this.userRepository.findByEmail(email);

    if (user && user.lockedUntil && Date.now() < user.lockedUntil) {
      throw new UnauthorizedException({
        error:
          'Conta temporariamente bloqueada por múltiplas tentativas. Tente novamente em alguns minutos.',
      });
    }

    if (!user || !bcrypt.compareSync(input.password, user.password)) {
      if (user) {
        this.userRepository.incrementLoginAttempts(user.id);
      }
      throw new UnauthorizedException({ error: 'E-mail ou senha inválidos.' });
    }

    this.userRepository.resetLoginAttempts(user.id);

    if (!user.emailVerified) {
      throw new ForbiddenException({
        error: 'E-mail não verificado.',
        requiresVerification: true,
        email: user.email,
      });
    }

    if (user.twoFactorEnabled) {
      return {
        requiresTwoFactor: true,
        userId: user.id,
        message: 'Código 2FA necessário.',
      };
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
