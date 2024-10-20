import { generateStoryImage } from './handlers/generateStoryImage';
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
      case pathname === '/stories/generate': {
        return await getStoryIdeas(request);
      }
      case pathname === '/stories/images/generate': {
        return await generateStoryImage(request);
      }
    }
  }
  return new Response('Not Found', { status: 404 });
}
