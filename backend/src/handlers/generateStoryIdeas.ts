import * as v from 'valibot';

import { db } from '~/db/db';
import type { Story } from '~/db/schema';
import { storiesTable } from '~/db/schema';
import { generateId } from '~/support/generateId';
import { openai } from '~/support/openai';
import { toJsonSchema } from '~/support/toJsonSchema';

const prompt = `
Generate 5 story ideas for kids stories. For each idea write a title and a short description of the story that could be given to an LLM to generate the full story. Also generate a prompt for a cover image for this story.
`.trim();

const resultSchema = v.object({
  ideas: v.array(
    v.object({
      title: v.string(),
      description: v.string(),
      imagePrompt: v.string(),
    }),
  ),
});

type Result = v.InferOutput<typeof resultSchema>;

const resultJsonSchema = toJsonSchema(resultSchema);

export async function generateStoryIdeas(_request: Request): Promise<Response> {
  const completion = await openai.chat.completions.create({
    model: 'gpt-4o',
    messages: [
      {
        role: 'user',
        content: prompt,
      },
    ],
    response_format: {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      type: 'json_schema',
      json_schema: {
        name: 'story_ideas_schema',
        schema: resultJsonSchema,
      },
    },
  });
  const rawJson = completion.choices[0]?.message.content ?? '';
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  const result: Result = JSON.parse(rawJson) as never;
  const now = Date.now();
  const stories: Array<Story> = [];
  for (const { title, description, imagePrompt } of result.ideas) {
    const id = generateId(now);
    const story: Story = {
      id,
      title,
      description,
      imagePrompt,
      imageUrl: null,
      content: null,
      audio: null,
    };
    // TODO: Kick off the image/content generation
    await db.insert(storiesTable).values(story);
    stories.push(story);
  }
  return Response.json({
    success: true,
    stories: stories.map(({ id, title, description }) => {
      return { id, title, description };
    }),
  });
}
