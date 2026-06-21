import {
  Catch,
  ExceptionFilter,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Response } from 'express';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      if (typeof body === 'string') {
        response.status(status).json({ error: body });
        return;
      }

      if (body && typeof body === 'object') {
        const payload = body as Record<string, unknown>;

        if (Array.isArray(payload.errors)) {
          response.status(status).json(payload);
          return;
        }

        if (typeof payload.error === 'string') {
          response.status(status).json(payload);
          return;
        }

        if (typeof payload.message === 'string') {
          response.status(status).json({ error: payload.message });
          return;
        }

        if (Array.isArray(payload.message)) {
          response.status(status).json({ errors: payload.message.map(String) });
          return;
        }
      }

      response.status(status).json({ error: 'Requisição inválida.' });
      return;
    }

    console.error(exception);
    response
      .status(HttpStatus.INTERNAL_SERVER_ERROR)
      .json({ error: 'Erro interno do servidor.' });
  }
}
