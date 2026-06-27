import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const EmailSchema = z
  .string()
  .trim()
  .min(1, 'E-mail é obrigatório.')
  .max(255, 'E-mail deve ter no máximo 255 caracteres.')
  .email('E-mail inválido.');

export const RegisterSchema = z.object({
  email: EmailSchema,
  password: z.string().min(6, 'Senha deve ter no mínimo 6 caracteres.'),
});

export class RegisterDto extends createZodDto(RegisterSchema) {}

export const VerifyEmailSchema = z.object({
  email: EmailSchema,
  code: z.string().regex(/^\d{6}$/, 'Código de verificação inválido.'),
});

export class VerifyEmailDto extends createZodDto(VerifyEmailSchema) {}

export const LoginSchema = z.object({
  email: EmailSchema,
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export class LoginDto extends createZodDto(LoginSchema) {}

export const TwoFactorAuthenticateSchema = z.object({
  userId: z.coerce.number().int().positive(),
  code: z.string().regex(/^\d+$/, 'Código 2FA inválido.'),
});

export class TwoFactorAuthenticateDto extends createZodDto(
  TwoFactorAuthenticateSchema,
) {}

export const TwoFactorVerifySchema = z.object({
  code: z.string().regex(/^\d+$/, 'Código inválido.'),
});

export class TwoFactorVerifyDto extends createZodDto(TwoFactorVerifySchema) {}

export const TwoFactorSetupSchema = z.object({
  password: z.string().min(1, 'Senha é obrigatória.'),
});

export class TwoFactorSetupDto extends createZodDto(TwoFactorSetupSchema) {}

export const ForgotPasswordSchema = z.object({
  email: EmailSchema,
});

export class ForgotPasswordDto extends createZodDto(ForgotPasswordSchema) {}

export const VerifyResetCodeSchema = z.object({
  email: EmailSchema,
  code: z.string().regex(/^\d{6}$/, 'Código de recuperação inválido.'),
});

export class VerifyResetCodeDto extends createZodDto(VerifyResetCodeSchema) {}

export const ResetPasswordSchema = z.object({
  email: EmailSchema,
  code: z.string().regex(/^\d{6}$/, 'Código de recuperação inválido.'),
  newPassword: z
    .string()
    .min(6, 'Nova senha deve ter no mínimo 6 caracteres.'),
});

export class ResetPasswordDto extends createZodDto(ResetPasswordSchema) {}

export const ChangePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Senha atual é obrigatória.'),
  newPassword: z.string().min(6, 'Nova senha deve ter no mínimo 6 caracteres.'),
});

export class ChangePasswordDto extends createZodDto(ChangePasswordSchema) {}

export const UpdateProfileSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, 'Nome é obrigatório.')
    .max(100, 'Nome deve ter no máximo 100 caracteres.'),
});

export class UpdateProfileDto extends createZodDto(UpdateProfileSchema) {}
