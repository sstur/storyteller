import './src/support/dotenv';

import { defineConfig } from 'drizzle-kit';

import { DB_FILE_NAME } from './src/support/constants';

export default defineConfig({
  out: './drizzle',
  schema: './src/db/schema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: DB_FILE_NAME,
  },
});
