import { Injectable, Inject } from '@nestjs/common';
import {
  RESUME_REPOSITORY,
  type ResumeRepository,
} from '../interfaces/resume-repository.interface';

export interface CreateResumeInput {
  name: string;
  phone: string;
  email: string;
  website: string;
  experience: string;
  userId: number;
}

@Injectable()
export class CreateResumeUseCase {
  constructor(
    @Inject(RESUME_REPOSITORY)
    private readonly resumeRepository: ResumeRepository,
  ) {}

  execute(input: CreateResumeInput) {
    const id = this.resumeRepository.create({
      name: input.name.trim(),
      phone: input.phone.trim() ? input.phone.trim() : null,
      email: input.email.trim().toLowerCase(),
      website: input.website.trim() ? input.website.trim() : null,
      experience: input.experience.trim(),
      userId: input.userId,
    });

    return { id };
  }
}
