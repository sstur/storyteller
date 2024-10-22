/* eslint-disable @typescript-eslint/ban-ts-comment */
import { generateStoryContent } from '~/handlers/getStoryContent';
import { HttpError } from '~/support/HttpError';
import { openai } from '~/support/openai';
import { store } from '~/support/store';
import type { Story } from '~/types/Story';

const prompt = `
Read the following kids story in a fun, fast-paced and cheerful way.
`.trim();

async function generateStoryAudio(story: Story) {
  const contentPromise = story.contentPromise ?? generateStoryContent(story);
  story.contentPromise = contentPromise;

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
  return audioData;
}

export async function getStoryAudio(
  _request: Request,
  params: { id: string },
): Promise<Response> {
  const { id } = params;
  const story = store.stories.get(id);

  if (!story) {
    throw new HttpError(404, 'Not found');
  }

  const audioPromise = story.audioPromise ?? generateStoryAudio(story);
  story.audioPromise = audioPromise;

  const audioData = await audioPromise;

  return new Response(audioData, {
    headers: {
      'Content-Type': 'audio/mp3',
      'Content-Length': audioData.length.toString(),
      'Content-Disposition': `inline; filename="audio.mp3"`,
    },
  });
}
