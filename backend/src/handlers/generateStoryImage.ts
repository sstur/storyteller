/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { fal } from '~/support/fal';
import { HttpError } from '~/support/HttpError';

type Image = {
  url: string;
  content_type: string;
};

export async function generateStoryImage(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const prompt = searchParams.get('prompt');
  if (!prompt) {
    throw new HttpError(400, 'Prompt is required');
  }

  const requestId = await new Promise<string>((resolve, reject) => {
    fal
      .subscribe('fal-ai/flux-pro/v1.1', {
        input: { prompt },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === 'COMPLETED') {
            resolve(update.request_id);
          }
        },
      })
      .catch((error) => reject(error));
  });

  const result = await fal.queue.result('fal-ai/flux-pro/v1.1', {
    requestId,
  });

  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const images = Object(result.data).images as Array<Image>;

  return Response.json({ imageUrl: images[0]?.url ?? '' });
}
