/* eslint-disable @typescript-eslint/ban-ts-comment */
import { eq } from 'drizzle-orm';

import { db } from '~/db/db';
import type { Story } from '~/db/schema';
import { storiesTable } from '~/db/schema';
import { generateStoryContent } from '~/handlers/getStoryContent';
import { HttpError } from '~/support/HttpError';
import { openai } from '~/support/openai';
import { saveFile } from '~/support/saveFile';
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
  const audioUrl = await saveFile(filename, 'audio/mp3', audioData);
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
