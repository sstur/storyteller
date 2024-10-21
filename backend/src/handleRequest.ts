import { generateStoryIdeas } from './handlers/generateStoryIdeas';
import { getStoryAudio } from './handlers/getStoryAudio';
import { getStoryContent } from './handlers/getStoryContent';
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
      case new RegExp('^/stories/(\\d+)/content$').test(pathname): {
        const id = pathname.slice(1).split('/')[1] ?? '';
        return await getStoryContent(request, { id });
      }
      case new RegExp('^/stories/(\\d+)/audio/status$').test(pathname): {
        const id = pathname.slice(1).split('/')[1] ?? '';
        await getStoryAudio(request, { id });
        return Response.json({ status: 'ready' });
      }
      case new RegExp('^/stories/(\\d+)/audio.wav$').test(pathname): {
        const id = pathname.slice(1).split('/')[1] ?? '';
        const response = await getStoryAudio(request, { id });
        return response;
      }
    }
  }
  return new Response('Not Found', { status: 404 });
}
