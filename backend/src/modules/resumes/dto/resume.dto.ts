import { createZodDto } from 'nestjs-zod';
import { z } from 'zod';
import { sanitize } from '../../../common/validation/sanitize';

const ResumeIdSchema = z.object({
  id: z.coerce.number().int().positive(),
});

export class ResumeIdDto extends createZodDto(ResumeIdSchema) {}

const sanitizedString = (min: number, max: number, label: string) =>
  z
    .string()
    .trim()
    .min(min, `${label} deve ter entre ${min} e ${max} caracteres.`)
    .max(max, `${label} deve ter entre ${min} e ${max} caracteres.`)
    .transform(sanitize);

const optionalUrl = z.union([
  z.literal(''),
  z
    .string()
    .trim()
    .url('Informe uma URL válida (ex: https://exemplo.com).')
    .refine(
      (url) => url.startsWith('http://') || url.startsWith('https://'),
      { message: 'URL deve começar com http:// ou https://.' },
    )
    .transform(sanitize),
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
  name: sanitizedString(3, 100, 'Nome'),
  phone: optionalPhone,
  email: z.string().trim().email('Informe um endereço de e-mail válido.'),
  website: optionalUrl,
  experience: sanitizedString(10, 3000, 'Experiência profissional'),
});

export class CreateResumeDto extends createZodDto(CreateResumeSchema) {}
