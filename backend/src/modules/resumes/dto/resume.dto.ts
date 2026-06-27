import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';

const ResumeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export class ResumeIdDto extends createZodDto(ResumeIdSchema) {}

const optionalUrl = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .url('Informe uma URL válida (ex: https://exemplo.com).')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      { message: 'URL deve começar com http:// ou https://.' },
    ),
]);

const optionalPhone = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .regex(
      /^[\d\s()+\-.]{8,20}$/,
      'Informe um telefone válido (apenas números, espaços, hífens e parênteses).',
    ),
]);

export const CreateResumeSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, 'Nome deve ter entre 3 e 100 caracteres.')
    .max(100, 'Nome deve ter entre 3 e 100 caracteres.'),
  phone: optionalPhone,
  email: z.string().trim().email('Informe um endereço de e-mail válido.'),
  website: optionalUrl,
  experience: z
    .string()
    .trim()
    .min(10, 'Experiência profissional deve ter entre 10 e 3000 caracteres.')
    .max(3000, 'Experiência profissional deve ter entre 10 e 3000 caracteres.'),
});

export class CreateResumeDto extends createZodDto(CreateResumeSchema) {}
