import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import type { JwtPayload } from '../../common/services/jwt-token.service';
import { CreateResumeDto, ResumeIdDto } from './dto/resume.dto';
import { CreateResumeUseCase } from './use-cases/create-resume.use-case';
import { GetResumeUseCase } from './use-cases/get-resume.use-case';
import { ListResumesUseCase } from './use-cases/list-resumes.use-case';

type AuthenticatedRequest = Request & {
  user?: JwtPayload;
};

@Controller('resumes')
@UseGuards(JwtAuthGuard)
export class ResumeController {
  constructor(
    private readonly listResumesUseCase: ListResumesUseCase,
    private readonly createResumeUseCase: CreateResumeUseCase,
    private readonly getResumeUseCase: GetResumeUseCase,
  ) {}

  private getUserId(request: AuthenticatedRequest) {
    if (!request.user) {
      throw new UnauthorizedException({ error: 'Autenticação necessária.' });
    }
    return request.user.userId;
  }

  @Get()
  list(@Req() request: AuthenticatedRequest) {
    return this.listResumesUseCase.execute(this.getUserId(request));
  }

  @Post()
  store(
    @Req() request: AuthenticatedRequest,
    @Body() body: CreateResumeDto,
  ) {
    return this.createResumeUseCase.execute({
      ...body,
      userId: this.getUserId(request),
    });
  }

  @Get(':id')
  view(
    @Req() request: AuthenticatedRequest,
    @Param() params: ResumeIdDto,
  ) {
    return this.getResumeUseCase.execute(
      params.id,
      this.getUserId(request),
    );
  }
}
