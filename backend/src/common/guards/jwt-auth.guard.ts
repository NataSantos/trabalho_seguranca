import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import {
  JwtTokenService,
  type JwtPayload,
} from '../services/jwt-token.service';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const header = request.headers.authorization;

    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException({ error: 'Autenticação necessária.' });
    }

    try {
      const token = header.slice('Bearer '.length);
      request.user = this.jwtTokenService.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException({ error: 'Token inválido ou expirado.' });
    }
  }
}
