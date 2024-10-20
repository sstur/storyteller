import { generateStoryIdeas } from './handlers/generateStoryIdeas';
import { getStoryImage } from './handlers/getStoryImage';

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
        return await generateStoryIdeas(request);
      }
      case new RegExp('^/stories/(\\d+)/images/cover$').test(pathname): {
        const id = pathname.slice(1).split('/')[1] ?? '';
        return await getStoryImage(request, { id });
      }
    }
  }
  return new Response('Not Found', { status: 404 });
}
