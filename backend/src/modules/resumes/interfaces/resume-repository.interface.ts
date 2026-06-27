import type { ResumeRow } from '../../../common/database/schema';

export const RESUME_REPOSITORY = Symbol('RESUME_REPOSITORY');

export interface CreateResumeInput {
  name: string;
  phone: string | null;
  email: string;
  website: string | null;
  experience: string;
  userId: number;
}

export interface ResumeRepository {
  findAll(userId: number): Array<Pick<ResumeRow, 'id' | 'name' | 'email'>>;
  findById(id: number, userId: number): ResumeRow | null;
  create(data: CreateResumeInput): number;
}
