import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  RESUME_REPOSITORY,
  type ResumeRepository,
} from '../interfaces/resume-repository.interface';

@Injectable()
export class GetResumeUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepository: ResumeRepository,
  ) {}

  execute(id: number) {
    const resume = this.resumeRepository.findById(id);

    if (!resume) {
      throw new NotFoundException({ error: 'Currículo não encontrado.' });
    }

    return resume;
  }
}
