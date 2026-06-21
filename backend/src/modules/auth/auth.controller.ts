import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/services/jwt-token.service';
import {
  LoginDto,
  RegisterDto,
  TwoFactorAuthenticateDto,
  TwoFactorVerifyDto,
  VerifyEmailDto,
} from './dto/auth.dto';
import { LoginUseCase } from './use-cases/login.use-case';
import { MeUseCase } from './use-cases/me.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { TwoFactorAuthenticateUseCase } from './use-cases/two-factor-authenticate.use-case';
import { TwoFactorSetupUseCase } from './use-cases/two-factor-setup.use-case';
import { TwoFactorVerifyUseCase } from './use-cases/two-factor-verify.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Controller('auth')
export class AuthController {
  constructor(
    private readonly registerUseCase: RegisterUseCase,
    private readonly verifyEmailUseCase: VerifyEmailUseCase,
    private readonly loginUseCase: LoginUseCase,
    private readonly twoFactorAuthenticateUseCase: TwoFactorAuthenticateUseCase,
    private readonly twoFactorSetupUseCase: TwoFactorSetupUseCase,
    private readonly twoFactorVerifyUseCase: TwoFactorVerifyUseCase,
    private readonly meUseCase: MeUseCase,
  ) {}

  private getUserId(request: AuthenticatedRequest) {
    if (!request.user) {
      throw new UnauthorizedException({ error: 'Autenticação necessária.' });
    }

    return request.user.userId;
  }

  @Post('register')
  register(@Body() body: RegisterDto) {
    return this.registerUseCase.execute(body);
  }

  @Post('verify-email')
  verifyEmail(@Body() body: VerifyEmailDto) {
    return this.verifyEmailUseCase.execute(body);
  }

  @Post('login')
  login(@Body() body: LoginDto) {
    return this.loginUseCase.execute(body);
  }

  @Post('2fa/authenticate')
  twoFactorAuthenticate(@Body() body: TwoFactorAuthenticateDto) {
    return this.twoFactorAuthenticateUseCase.execute(body);
  }

  @Get('2fa/setup')
  @UseGuards(JwtAuthGuard)
  twoFactorSetup(@Req() request: AuthenticatedRequest) {
    return this.twoFactorSetupUseCase.execute({
      userId: this.getUserId(request),
    });
  }

  @Post('2fa/verify')
  @UseGuards(JwtAuthGuard)
  twoFactorVerify(
    @Req() request: AuthenticatedRequest,
    @Body() body: TwoFactorVerifyDto,
  ) {
    return this.twoFactorVerifyUseCase.execute({
      userId: this.getUserId(request),
      code: body.code,
    });
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  me(@Req() request: AuthenticatedRequest) {
    return this.meUseCase.execute({ userId: this.getUserId(request) });
  }
}
