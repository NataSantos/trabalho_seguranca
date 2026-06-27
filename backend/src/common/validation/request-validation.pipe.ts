import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

const GENERIC_MESSAGE = 'Validação falhou.';

/**
 * Zod generates default messages like "Invalid input: expected string, received null"
 * which expose internal type information. We replace those with a generic message
 * while keeping custom schema-defined messages (already in Portuguese).
 */
function toGenericMessage(message: string): string {
  if (
    message === 'Required' ||
    /^(Invalid input|Expected|Received)/i.test(message)
  ) {
    return GENERIC_MESSAGE;
  }
  return message;
}

export const RequestValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    if (error instanceof ZodError) {
      return new BadRequestException({
        errors: error.issues.map((issue) => toGenericMessage(issue.message)),
      });
    }

    return new BadRequestException({
      errors: [GENERIC_MESSAGE],
    });
  },
});
