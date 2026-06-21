import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TwoFactorService } from '../../common/services/two-factor.service';
import { SecurityModule } from '../../common/security/security.module';
import { AuthController } from './auth.controller';
import { USER_REPOSITORY } from './interfaces/user-repository.interface';
import { DrizzleUserRepository } from './repositories/drizzle-user.repository';
import { LoginUseCase } from './use-cases/login.use-case';
import { MeUseCase } from './use-cases/me.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { TwoFactorAuthenticateUseCase } from './use-cases/two-factor-authenticate.use-case';
import { TwoFactorSetupUseCase } from './use-cases/two-factor-setup.use-case';
import { TwoFactorVerifyUseCase } from './use-cases/two-factor-verify.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [AuthController],
  providers: [
    JwtAuthGuard,
    TwoFactorService,
    RegisterUseCase,
    VerifyEmailUseCase,
    LoginUseCase,
    TwoFactorAuthenticateUseCase,
    TwoFactorSetupUseCase,
    TwoFactorVerifyUseCase,
    MeUseCase,
    {
      provide: USER_REPOSITORY,
      useClass: DrizzleUserRepository,
    },
  ],
})
export class AuthModule {}
