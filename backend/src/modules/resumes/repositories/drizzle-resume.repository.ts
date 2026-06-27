import { Injectable } from '@nestjs/common';
import { and, asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../../../common/database/database.service';
import { resumes } from '../../../common/database/schema';
import {
  type CreateResumeInput,
  type ResumeRepository,
} from '../interfaces/resume-repository.interface';

@Injectable()
export class DrizzleResumeRepository implements ResumeRepository {
  constructor(private readonly databaseService: DatabaseService) {}

  private get db() {
    return this.databaseService.connection;
  }

  findAll(userId: number) {
    return this.db
      .select({ id: resumes.id, name: resumes.name, email: resumes.email })
      .from(resumes)
      .where(eq(resumes.userId, userId))
      .orderBy(asc(resumes.id))
      .all();
  }

  findById(id: number, userId: number) {
    return (
      this.db
        .select()
        .from(resumes)
        .where(and(eq(resumes.id, id), eq(resumes.userId, userId)))
        .get() ?? null
    );
  }

  create(data: CreateResumeInput) {
    const result = this.db.insert(resumes).values(data).run();
    return Number(result.lastInsertRowid);
  }
}
