import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  USER_REPOSITORY,
  type UserRepository,
} from '../interfaces/user-repository.interface';
import { TwoFactorService } from '../../../common/services/two-factor.service';

export interface TwoFactorSetupInput {
  userId: number;
}

@Injectable()
export class TwoFactorSetupUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepository: UserRepository,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async execute(input: TwoFactorSetupInput) {
    const user = this.userRepository.findById(input.userId);

    if (!user) {
      throw new NotFoundException({ error: 'Usuário não encontrado.' });
    }

    const secret =
      user.twoFactorSecret && !user.twoFactorEnabled
        ? user.twoFactorSecret
        : this.twoFactorService.generateSecret();

    if (!user.twoFactorSecret || user.twoFactorEnabled) {
      this.userRepository.setTwoFactorSecret(user.id, secret);
    }

    return {
      secret,
      qrcode: await this.twoFactorService.generateQrCode(secret, user.email),
    };
  }
}
