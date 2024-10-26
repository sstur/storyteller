import { and, desc, eq } from 'drizzle-orm';
import { addRoute, createRouter, findRoute } from 'rou3';

import { generateStories } from '~/handlers/generateStories';
import { generateStorySuggestions } from '~/handlers/generateStorySuggestions';
import {
  getStoryAudioDetailsResponse,
  getStoryAudioPayloadResponse,
} from '~/handlers/getStoryAudio';
import { getStoryContentResponse } from '~/handlers/getStoryContent';
import { getStoryImageResponse } from '~/handlers/getStoryImage';

import { db } from './db/db';
import { storiesTable } from './db/schema';
import { getSessionId } from './support/getSessionId';
import { HttpError } from './support/HttpError';

type Handler = (
  request: Request,
  params?: Record<string, string>,
) => Response | Promise<Response>;

const router = createRouter<Handler>();

addRoute(router, 'GET', '/', () => {
  return new Response('Hello World!');
});

addRoute(router, 'GET', '/stories', async (request) => {
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
});

addRoute(router, 'GET', '/stories/suggestions', async (_request) => {
  const suggestions = await generateStorySuggestions();
  return Response.json(suggestions);
});

addRoute(router, 'POST', '/stories/generate', async (request) => {
  await generateStories(request);
  return Response.json({ success: true });
});

addRoute(router, 'DELETE', '/stories/:id', async (request, params) => {
  const id = params?.id ?? '';
  const sessionId = getSessionId(request);
  const [story] = await db
    .select()
    .from(storiesTable)
    .where(and(eq(storiesTable.createdBy, sessionId), eq(storiesTable.id, id)));

  if (!story) {
    throw new HttpError(404, 'Not found');
  }

  // This is sort of a soft-delete, we just dis-associate the story from the user
  await db
    .update(storiesTable)
    .set({ createdBy: null })
    .where(eq(storiesTable.id, id));

  return Response.json({ success: true });
});

addRoute(
  router,
  'GET',
  '/stories/:id/images/cover',
  async (request, params) => {
    const id = params?.id ?? '';
    return await getStoryImageResponse(request, { id });
  },
);

addRoute(router, 'GET', '/stories/:id/content', async (request, params) => {
  const id = params?.id ?? '';
  return await getStoryContentResponse(request, { id });
});

addRoute(
  router,
  'GET',
  '/stories/:id/audio/details',
  async (request, params) => {
    const id = params?.id ?? '';
    return await getStoryAudioDetailsResponse(request, { id });
  },
);

addRoute(router, 'GET', '/stories/:id/audio', async (request, params) => {
  const id = params?.id ?? '';
  return await getStoryAudioPayloadResponse(request, { id });
});

export async function handleRequest(
  pathname: string,
  request: Request,
): Promise<Response> {
  const result = findRoute(router, request.method, pathname);
  if (result) {
    const { data: handler, params } = result;
    return await handler(request, params);
  }
  return new Response('Not Found', { status: 404 });
}
