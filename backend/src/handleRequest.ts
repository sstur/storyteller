import { addRoute, createRouter, findRoute } from 'rou3';

import { generateStoryIdeas } from '~/handlers/generateStoryIdeas';
import { getStoryAudio } from '~/handlers/getStoryAudio';
import { getStoryContent } from '~/handlers/getStoryContent';
import { getStoryImage } from '~/handlers/getStoryImage';

type Handler = (
  request: Request,
  params?: Record<string, string>,
) => Response | Promise<Response>;

const router = createRouter<Handler>();

addRoute(router, 'GET', '/', () => {
  return new Response('Hello World!');
});

addRoute(router, 'GET', '/stories/generate', async (request) => {
  return await generateStoryIdeas(request);
});

addRoute(
  router,
  'GET',
  '/stories/:id/images/cover',
  async (request, params) => {
    const id = params?.id ?? '';
    return await getStoryImage(request, { id });
  },
);

addRoute(router, 'GET', '/stories/:id/content', async (request, params) => {
  const id = params?.id ?? '';
  return await getStoryContent(request, { id });
});

addRoute(
  router,
  'GET',
  '/stories/:id/audio/status',
  async (request, params) => {
    const id = params?.id ?? '';
    await getStoryAudio(request, { id });
    return Response.json({ status: 'ready' });
  },
);

addRoute(router, 'GET', '/stories/:id/audio', async (request, params) => {
  const id = params?.id ?? '';
  return await getStoryAudio(request, { id });
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
