import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import request from 'supertest';
import { App } from 'supertest/types';
import { AppModule } from '../src/app.module';

describe('App (e2e)', () => {
  let app: INestApplication<App>;
  const tmpDir = join(process.cwd(), 'test', '.tmp-backend');

  beforeAll(async () => {
    process.env.DB_DIR = tmpDir;
    process.env.DB_FILE = 'e2e-backend.db';

    rmSync(tmpDir, { recursive: true, force: true });
    mkdirSync(tmpDir, { recursive: true });

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    await app.init();
  });

  it('registers a user', async () => {
    const payload = {
      email: `user-${Date.now()}@example.com`,
      password: '123456',
    };

    const response = await request(app.getHttpServer())
      .post('/api/auth/register')
      .send(payload)
      .expect(201);

    expect(response.body).toHaveProperty('id');
    expect(response.body).toHaveProperty('code');
  });

  afterAll(async () => {
    await app.close();
    rmSync(tmpDir, { recursive: true, force: true });
  });
});
