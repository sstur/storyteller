import { desc, eq } from 'drizzle-orm';

import { db } from '~/db/db';
import { storiesTable } from '~/db/schema';
import { getSessionId } from '~/support/getSessionId';

export async function getStoriesResponse(request: Request) {
  const sessionId = getSessionId(request);
  const stories = await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.createdBy, sessionId))
    .orderBy(desc(storiesTable.id));
  return Response.json({
    success: true,
    stories: stories.map(({ id, title, description }) => {
      return { id, title, description };
    }),
  });
}
