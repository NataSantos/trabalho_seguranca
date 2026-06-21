import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: number;
}

@Injectable()
export class JwtTokenService {
  constructor(private readonly configService: ConfigService) {}

  private get secret() {
    return (
      this.configService.get<string>('JWT_SECRET') ??
      'curriculo-app-secret-key-change-in-production'
    );
  }

  generateToken(userId: number) {
    return jwt.sign({ userId }, this.secret, { expiresIn: '2h' });
  }

  verifyToken(token: string): JwtPayload {
    return jwt.verify(token, this.secret) as JwtPayload;
  }
}
