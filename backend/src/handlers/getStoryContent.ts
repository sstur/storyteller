import { eq } from 'drizzle-orm';
import * as v from 'valibot';

import { db } from '~/db/db';
import type { Story } from '~/db/schema';
import { storiesTable } from '~/db/schema';
import { HttpError } from '~/support/HttpError';
import { openai } from '~/support/openai';
import { store } from '~/support/store';
import { toJsonSchema } from '~/support/toJsonSchema';
import type { ContentBlock } from '~/types/ContentBlock';

const prompt = `
Generate a kids story based on the following title and description.
It should be about 5 or 6 paragraphs long.
Do NOT use markdown or any other formatting. Each paragraph should be plain prose text.
`.trim();

const resultSchema = v.object({
  paragraphs: v.array(v.string()),
});

type Result = v.InferOutput<typeof resultSchema>;

const resultJsonSchema = toJsonSchema(resultSchema);

export async function generateStoryContent(story: Story) {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt + '\n\n' + story.title + '\n\n' + story.description,
      },
    ],
    response_format: {
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
  const content = result.paragraphs;
  await db
    .update(storiesTable)
    .set({ content })
    .where(eq(storiesTable.id, story.id));
  return content;
}

async function getStoryContent(story: Story) {
  const { id } = story;

  if (story.content !== null) {
    return story.content;
  }

  const contentPromise =
    store.contentGenPromises.get(id) ?? generateStoryContent(story);
  store.contentGenPromises.set(id, contentPromise);

  return await contentPromise;
}

export async function getStoryContentResponse(
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

  const content = await getStoryContent(story);

  const contentBlocks = content.map(
    (text): ContentBlock => ({ type: 'paragraph', text }),
  );

  return Response.json({
    id: story.id,
    title: story.title,
    content: contentBlocks,
  });
}
