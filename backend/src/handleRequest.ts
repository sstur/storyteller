import { getStoryIdeas } from './handlers/getStoryIdeas';

export async function handleRequest(
  pathname: string,
  request: Request,
): Promise<Response> {
  if (request.method === 'GET') {
    switch (true) {
      case pathname === '/': {
        return new Response('Hello World!');
      }
      case pathname === '/story-ideas': {
        return await getStoryIdeas(request);
      }
    }
  }
  return new Response('Not Found', { status: 404 });
}
