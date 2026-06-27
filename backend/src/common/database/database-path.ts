import { isAbsolute, join, dirname, resolve } from 'node:path';

export function resolveDatabasePath(
  cwd: string,
  dbDir: string | undefined,
  dbFile: string | undefined,
) {
  const dataDir =
    dbDir && isAbsolute(dbDir) ? dbDir : join(cwd, dbDir ?? 'data');
  const file = dbFile ?? 'curriculos.db';

  if (isAbsolute(file)) {
    return file;
  }

  const pathWithCwd = resolve(cwd, file);
  const pathWithDataDir = join(dataDir, file);

  return file.includes('/') || file.includes('\\')
    ? pathWithCwd
    : pathWithDataDir;
}

export function resolveDatabaseDirectory(dbPath: string) {
  return dirname(dbPath);
}
