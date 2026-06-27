import { Module } from '@nestjs/common';
import { APP_FILTER, APP_PIPE } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { ResumeModule } from './modules/resumes/resume.module';
import { DatabaseModule } from './common/database/database.module';
import { SecurityModule } from './common/security/security.module';
import { ApiExceptionFilter } from './common/http/api-exception.filter';
import { RequestValidationPipe } from './common/validation/request-validation.pipe';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 10,
      },
    ]),
    DatabaseModule,
    SecurityModule,
    AuthModule,
    ResumeModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_PIPE,
      useClass: RequestValidationPipe,
    },
    {
      provide: APP_FILTER,
      useClass: ApiExceptionFilter,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
