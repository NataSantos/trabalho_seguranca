import { Inject, Injectable } from '@nestjs/common';
import {
  RESUME_REPOSITORY,
  type ResumeRepository,
} from '../interfaces/resume-repository.interface';

@Injectable()
export class ListResumesUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepository: ResumeRepository,
  ) {}

  execute(userId: number) {
    return this.resumeRepository.findAll(userId);
  }
}
