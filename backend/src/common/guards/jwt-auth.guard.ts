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

/** Extract JWT from either Authorization header or httpOnly cookie */
function extractToken(request: AuthenticatedRequest): string | null {
  // 1. Try Authorization header first
  const header = request.headers.authorization;
  if (header?.startsWith('Bearer ')) {
    return header.slice('Bearer '.length);
  }

  // 2. Fallback to httpOnly cookie (set by login/2fa endpoints)
  const cookieHeader = request.headers.cookie;
  if (cookieHeader) {
    for (const cookie of cookieHeader.split(';')) {
      const [name, ...rest] = cookie.trim().split('=');
      if (name === 'token') {
        return rest.join('=');
      }
    }
  }

  return null;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtTokenService: JwtTokenService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = extractToken(request);

    if (!token) {
      throw new UnauthorizedException({ error: 'Autenticação necessária.' });
    }

    try {
      request.user = this.jwtTokenService.verifyToken(token);
      return true;
    } catch {
      throw new UnauthorizedException({ error: 'Token inválido ou expirado.' });
    }
  }
}
