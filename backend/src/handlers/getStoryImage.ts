/* eslint-disable @typescript-eslint/prefer-promise-reject-errors */
import { eq } from 'drizzle-orm';

import { db } from '~/db/db';
import type { Story } from '~/db/schema';
import { storiesTable } from '~/db/schema';
import { fal } from '~/support/fal';
import { HttpError } from '~/support/HttpError';
import { saveFileFromUrl } from '~/support/saveFile';
import { store } from '~/support/store';

type Image = {
  url: string;
  width: number;
  height: number;
  content_type: string;
};

export async function generateImage(story: Story) {
  const prompt = [
    story.imagePrompt,
    // Not sure if this is the right way to add directives like this
    'There is no text in the image.',
  ].join('\n');
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
  const url = images[0]?.url ?? '';
  const fileExt = url.split('.').pop() ?? '';
  const filename = `${story.id}-cover` + (fileExt ? `.${fileExt}` : '');
  const imageUrl = await saveFileFromUrl(filename, url);
  await db
    .update(storiesTable)
    .set({ imageUrl })
    .where(eq(storiesTable.id, story.id));
  return imageUrl;
}

export async function getStoryImage(story: Story) {
  const { id } = story;

  if (story.imageUrl !== null) {
    return story.imageUrl;
  }

  const imageUrlPromise =
    store.imageGenPromises.get(id) ?? generateImage(story);
  store.imageGenPromises.set(id, imageUrlPromise);

  return await imageUrlPromise;
}

export async function getStoryImageResponse(
  request: Request,
  params: { id: string },
): Promise<Response> {
  const { id } = params;
  const [story] = await db
    .select()
    .from(storiesTable)
    .where(eq(storiesTable.id, id));

  if (!story) {
    throw new HttpError(404, 'Not found');
  }

  const imageUrl = await getStoryImage(story);

  const response = await fetch(imageUrl);
  return new Response(response.body, {
    headers: response.headers,
  });
}
