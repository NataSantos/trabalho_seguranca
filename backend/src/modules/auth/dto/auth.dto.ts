import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const EmailSchema = z.string().trim().email('E-mail inválido.');

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
