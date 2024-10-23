/* eslint-disable @typescript-eslint/ban-ts-comment */
import { eq } from 'drizzle-orm';

import { db } from '~/db/db';
import type { Story } from '~/db/schema';
import { storiesTable } from '~/db/schema';
import { generateStoryContent } from '~/handlers/getStoryContent';
import {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_API_TOKEN,
  CLOUDFLARE_BUCKET_NAME,
  CLOUDFLARE_PUBLIC_HOSTNAME,
} from '~/support/constants';
import { HttpError } from '~/support/HttpError';
import { openai } from '~/support/openai';
import { store } from '~/support/store';

const prompt = `
Read the following kids story in a fun, fast-paced and cheerful way.
`.trim();

async function generateStoryAudio(story: Story) {
  const { id } = story;

  const contentPromise =
    store.contentGenPromises.get(id) ?? generateStoryContent(story);
  store.contentGenPromises.set(id, contentPromise);

  const paragraphs = await contentPromise;

  const content = paragraphs.join('\n\n');

  const completion = await openai.chat.completions.create({
    model: 'gpt-4o-audio-preview',
    // @ts-ignore
    modalities: ['text', 'audio'],
    audio: { voice: 'alloy', format: 'mp3' },
    messages: [
      {
        role: 'user',
        content: prompt + '\n\n' + content,
      },
    ],
  });

  const audioData = Buffer.from(
    // @ts-ignore
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access
    completion.choices[0]?.message.audio.data,
    'base64',
  );

  const filename = `${id}-audio.mp3`;
  const response = await fetch(
    `https://api.cloudflare.com/client/v4/accounts/${CLOUDFLARE_ACCOUNT_ID}/r2/buckets/${CLOUDFLARE_BUCKET_NAME}/objects/${filename}`,
    {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${CLOUDFLARE_API_TOKEN}`,
        'Content-Type': 'audio/mp3',
      },
      body: audioData,
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to upload audio file to R2: ${response.status} ${response.statusText}`,
    );
  }

  const result = await response.json();

  if (Object(result).success !== true) {
    throw new Error(`Unsuccessful upload to R2: ${JSON.stringify(result)}`);
  }

  const audioUrl = `https://${CLOUDFLARE_PUBLIC_HOSTNAME}/${filename}`;
  await db
    .update(storiesTable)
    .set({ audioUrl })
    .where(eq(storiesTable.id, id));
  return audioUrl;
}

export async function getStoryAudio(story: Story) {
  const { id, audioUrl } = story;

  if (audioUrl !== null) {
    return audioUrl;
  }

  const audioPromise =
    store.audioGenPromises.get(id) ?? generateStoryAudio(story);
  store.audioGenPromises.set(id, audioPromise);

  return await audioPromise;
}

export async function getStoryAudioResponse(
  _request: Request,
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

  const audioUrl = await getStoryAudio(story);

  const response = await fetch(audioUrl);

  return new Response(response.body, {
    headers: {
      'Content-Type': 'audio/mp3',
      'Content-Disposition': `inline; filename="audio.mp3"`,
    },
  });
}
