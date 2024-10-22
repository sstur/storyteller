/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { fal } from '../support/fal';
import { HttpError } from '../support/HttpError';
import { store } from '../support/store';

type Image = {
  url: string;
  content_type: string;
};

export async function generateImage(prompt: string) {
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
  return images[0]?.url ?? '';
}

export async function getStoryImage(
  request: Request,
  params: { id: string },
): Promise<Response> {
  const { id } = params;
  const story = store.stories.get(id);

  if (!story) {
    throw new HttpError(404, 'Not found');
  }

  const imageUrlPromise =
    story.imageUrlPromise ?? generateImage(story.imagePrompt);
  story.imageUrlPromise = imageUrlPromise;

  const imageUrl = await imageUrlPromise;
  return Response.json({ imageUrl });
}
