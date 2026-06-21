import { BadRequestException } from '@nestjs/common';
import { createZodValidationPipe } from 'nestjs-zod';
import { ZodError } from 'zod';

export const RequestValidationPipe = createZodValidationPipe({
  createValidationException: (error: unknown) => {
    if (error instanceof ZodError) {
      return new BadRequestException({
        errors: error.issues.map((issue) => issue.message),
      });
    }

    return new BadRequestException({
      errors: ['Validation failed'],
    });
  },
});
