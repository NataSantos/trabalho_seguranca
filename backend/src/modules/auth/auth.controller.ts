import { Body, Controller, Get, Post, Put, Req, UseGuards } from '@nestjs/common';
import { UnauthorizedException } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/services/jwt-token.service';
import {
  ChangePasswordDto,
  ForgotPasswordDto,
  LoginDto,
  RegisterDto,
  ResetPasswordDto,
  TwoFactorAuthenticateDto,
  TwoFactorSetupDto,
  TwoFactorVerifyDto,
  UpdateProfileDto,
  VerifyEmailDto,
  VerifyResetCodeDto,
} from './dto/auth.dto';
import { ChangePasswordUseCase } from './use-cases/change-password.use-case';
import { ForgotPasswordUseCase } from './use-cases/forgot-password.use-case';
import { LoginUseCase } from './use-cases/login.use-case';
import { MeUseCase } from './use-cases/me.use-case';
import { RegisterUseCase } from './use-cases/register.use-case';
import { ResetPasswordUseCase } from './use-cases/reset-password.use-case';
import { TwoFactorAuthenticateUseCase } from './use-cases/two-factor-authenticate.use-case';
import { TwoFactorSetupUseCase } from './use-cases/two-factor-setup.use-case';
import { TwoFactorVerifyUseCase } from './use-cases/two-factor-verify.use-case';
import { UpdateProfileUseCase } from './use-cases/update-profile.use-case';
import { VerifyEmailUseCase } from './use-cases/verify-email.use-case';
import { VerifyResetCodeUseCase } from './use-cases/verify-reset-code.use-case';

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
    private readonly forgotPasswordUseCase: ForgotPasswordUseCase,
    private readonly verifyResetCodeUseCase: VerifyResetCodeUseCase,
    private readonly resetPasswordUseCase: ResetPasswordUseCase,
    private readonly changePasswordUseCase: ChangePasswordUseCase,
    private readonly updateProfileUseCase: UpdateProfileUseCase,
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

  @Post('2fa/setup')
  @UseGuards(JwtAuthGuard)
  twoFactorSetup(
    @Req() request: AuthenticatedRequest,
    @Body() body: TwoFactorSetupDto,
  ) {
    return this.twoFactorSetupUseCase.execute({
      userId: this.getUserId(request),
      password: body.password,
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

  @Post('forgot-password')
  forgotPassword(@Body() body: ForgotPasswordDto) {
    return this.forgotPasswordUseCase.execute(body);
  }

  @Post('verify-reset-code')
  verifyResetCode(@Body() body: VerifyResetCodeDto) {
    return this.verifyResetCodeUseCase.execute(body);
  }

  @Post('reset-password')
  resetPassword(@Body() body: ResetPasswordDto) {
    return this.resetPasswordUseCase.execute(body);
  }

  @Put('password')
  @UseGuards(JwtAuthGuard)
  changePassword(
    @Req() request: AuthenticatedRequest,
    @Body() body: ChangePasswordDto,
  ) {
    return this.changePasswordUseCase.execute({
      userId: this.getUserId(request),
      currentPassword: body.currentPassword,
      newPassword: body.newPassword,
    });
  }

  @Put('profile')
  @UseGuards(JwtAuthGuard)
  updateProfile(
    @Req() request: AuthenticatedRequest,
    @Body() body: UpdateProfileDto,
  ) {
    return this.updateProfileUseCase.execute({
      userId: this.getUserId(request),
      name: body.name,
    });
  }
}
