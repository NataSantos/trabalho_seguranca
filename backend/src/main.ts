import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { securityHeaders } from './common/middleware/security.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const expressApp = app.getHttpAdapter().getInstance() as {
    set: (name: string, value: number) => void;
  };

  expressApp.set('trust proxy', 1);
  app.setGlobalPrefix('api');
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true,
  });
  app.use(helmet());
  app.use(securityHeaders);
  app.use(json());
  app.use(urlencoded({ extended: true }));
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
