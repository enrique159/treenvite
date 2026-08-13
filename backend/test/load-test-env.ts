import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { parseEnv } from 'node:util';

const testEnvironmentPath = resolve(__dirname, '../.env.test');

if (existsSync(testEnvironmentPath)) {
  const fileEnvironment = parseEnv(readFileSync(testEnvironmentPath, 'utf8'));
  for (const [name, value] of Object.entries(fileEnvironment)) {
    if (!process.env[name]) process.env[name] = value;
  }
}

if (
  process.env.TEST_DB_HOST &&
  process.env.TEST_DB_NAME &&
  process.env.TEST_DB_USER
) {
  process.env.NODE_ENV = 'test';
  process.env.DB_HOST = process.env.TEST_DB_HOST;
  process.env.DB_PORT = process.env.TEST_DB_PORT ?? '3306';
  process.env.DB_NAME = process.env.TEST_DB_NAME;
  process.env.DB_USER = process.env.TEST_DB_USER;
  process.env.DB_PASSWORD = process.env.TEST_DB_PASSWORD ?? '';
  process.env.FRONTEND_ORIGIN = 'http://localhost:5173';
  process.env.JWT_ACCESS_SECRET =
    'test-access-secret-with-at-least-32-characters';
  process.env.ACCESS_CODE_PEPPER = 'test-code-pepper-with-enough-characters';
  process.env.API_TOKEN_PEPPER =
    'test-api-token-pepper-with-at-least-32-characters';
}
