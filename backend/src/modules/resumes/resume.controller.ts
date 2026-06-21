import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateResumeDto, ResumeIdDto } from './dto/resume.dto';
import { CreateResumeUseCase } from './use-cases/create-resume.use-case';
import { GetResumeUseCase } from './use-cases/get-resume.use-case';
import { ListResumesUseCase } from './use-cases/list-resumes.use-case';

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(
    private readonly listResumesUseCase: ListResumesUseCase,
    private readonly createResumeUseCase: CreateResumeUseCase,
    private readonly getResumeUseCase: GetResumeUseCase,
  ) {}

  @Get()
  list() {
    return this.listResumesUseCase.execute();
  }

  @Post()
  store(@Body() body: CreateResumeDto) {
    return this.createResumeUseCase.execute(body);
  }

  @Get(':id')
  view(@Param() params: ResumeIdDto) {
    return this.getResumeUseCase.execute(params.id);
  }
}
