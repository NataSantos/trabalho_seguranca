import type { ResumeRow } from '../../../common/database/schema';

export const RESUME_REPOSITORY = Symbol('RESUME_REPOSITORY');

export interface CreateResumeInput {
  name: string;
  phone: string | null;
  email: string;
  website: string | null;
  experience: string;
}

export interface ResumeRepository {
  findAll(): Array<Pick<ResumeRow, 'id' | 'name' | 'email'>>;
  findById(id: number): ResumeRow | null;
  create(data: CreateResumeInput): number;
}
