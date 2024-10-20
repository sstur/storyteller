import * as v from 'valibot';

import { HttpError } from '~/support/HttpError';
import { openai } from '~/support/openai';
import { store } from '~/support/store';
import { toJsonSchema } from '~/support/toJsonSchema';
import type { Story } from '~/types/Story';

import { generateImage } from './getStoryImage';

const prompt = `
Generate a kids story based on the following title and description.
It should be about 7 paragraphs long.
`.trim();

const resultSchema = v.object({
  paragraphs: v.array(v.string()),
});

type Result = v.InferOutput<typeof resultSchema>;

const resultJsonSchema = toJsonSchema(resultSchema);

async function generateStoryContent(story: Story) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt + '\n\n' + story.title + '\n\n' + story.description,
      },
    ],
    response_format: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      type: 'json_schema',
      json_schema: {
        name: 'story_content_schema',
        schema: resultJsonSchema,
      },
    },
  });
  const rawJson = completion.choices[0]?.message.content ?? '';
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const result: Result = JSON.parse(rawJson) as never;
  return result.paragraphs;
}

export async function getStoryContent(
  _request: Request,
  params: { id: string },
): Promise<Response> {
  const { id } = params;
  const story = store.stories.get(id);

  if (!story) {
    throw new HttpError(404, 'Not found');
  }

  const contentPromise = story.contentPromise ?? generateStoryContent(story);
  story.contentPromise = contentPromise;

  const imageUrlPromise =
    story.imageUrlPromise ?? generateImage(story.imagePrompt);
  story.imageUrlPromise = imageUrlPromise;

  const [paragraphs, imageUrl] = await Promise.all([
    contentPromise,
    imageUrlPromise,
  ]);

  return Response.json({
    id: story.id,
    title: story.title,
    paragraphs,
    imageUrl,
  });
}
