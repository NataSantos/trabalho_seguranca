import { Module } from '@nestjs/common';
import { DatabaseModule } from '../../common/database/database.module';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { SecurityModule } from '../../common/security/security.module';
import { ResumeController } from './resume.controller';
import { RESUME_REPOSITORY } from './interfaces/resume-repository.interface';
import { DrizzleResumeRepository } from './repositories/drizzle-resume.repository';
import { CreateResumeUseCase } from './use-cases/create-resume.use-case';
import { GetResumeUseCase } from './use-cases/get-resume.use-case';
import { ListResumesUseCase } from './use-cases/list-resumes.use-case';

@Module({
  imports: [DatabaseModule, SecurityModule],
  controllers: [ResumeController],
  providers: [
    JwtAuthGuard,
    ListResumesUseCase,
    CreateResumeUseCase,
    GetResumeUseCase,
    {
      provide: RESUME_REPOSITORY,
      useClass: DrizzleResumeRepository,
    },
  ],
})
export class ResumeModule {}
