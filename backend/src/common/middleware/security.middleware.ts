import type { NextFunction, Request, Response } from 'express';

export function securityHeaders(
  _req: Request,
  res: Response,
  next: NextFunction,
) {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader(
    'Cache-Control',
    'no-store, no-cache, must-revalidate, proxy-revalidate',
  );
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader(
    'Strict-Transport-Security',
    'max-age=31536000; includeSubDomains',
  );
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  next();
}
