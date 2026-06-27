import { resolveDatabaseDirectory, resolveDatabasePath } from './database-path';

describe('resolveDatabasePath', () => {
  it('does not duplicate nested db directories', () => {
    const dbPath = resolveDatabasePath(
      '/home/fabio/dev/seguranca-de-dados-g2/backend',
      './db',
      './db/db.sqlite',
    );

    expect(dbPath).toBe(
      '/home/fabio/dev/seguranca-de-dados-g2/backend/db/db.sqlite',
    );
    expect(resolveDatabaseDirectory(dbPath)).toBe(
      '/home/fabio/dev/seguranca-de-dados-g2/backend/db',
    );
  });
});
