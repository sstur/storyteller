import { drizzle } from 'drizzle-orm/libsql';

import { DB_FILE_NAME } from '~/support/constants';

export const db = drizzle(DB_FILE_NAME);
