/* eslint-disable no-console */
import 'dotenv/config';

import { eq } from 'drizzle-orm';

import { db } from '~/db/db';

import { usersTable } from '../db/schema';

async function main() {
  const user: typeof usersTable.$inferInsert = {
    name: 'John',
    age: 30,
    email: 'john@example.com',
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!');

  const users = await db.select().from(usersTable);
  console.log('Getting all users from the database: ', users);

  await db
    .update(usersTable)
    .set({
      age: 31,
    })
    .where(eq(usersTable.email, user.email));
  console.log('User info updated!');

  await db.delete(usersTable).where(eq(usersTable.email, user.email));
  console.log('User deleted!');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
