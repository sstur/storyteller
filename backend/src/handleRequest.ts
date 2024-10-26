import { desc, eq } from 'drizzle-orm';
import { addRoute, createRouter, findRoute } from 'rou3';

import { generateStoryIdeas } from '~/handlers/generateStoryIdeas';
import {
  getStoryAudioDetailsResponse,
  getStoryAudioPayloadResponse,
} from '~/handlers/getStoryAudio';
import { getStoryContentResponse } from '~/handlers/getStoryContent';
import { getStoryImageResponse } from '~/handlers/getStoryImage';

import { db } from './db/db';
import { storiesTable } from './db/schema';
import { getSessionId } from './support/getSessionId';

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

addRoute(router, 'POST', '/stories/generate', async (request) => {
  return await generateStoryIdeas(request);
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
