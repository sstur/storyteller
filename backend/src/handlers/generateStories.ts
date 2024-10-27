import * as v from 'valibot';

import { db } from '~/db/db';
import type { InsertStoryInput } from '~/db/schema';
import { storiesTable } from '~/db/schema';
import { generateId } from '~/support/generateId';
import { getSessionId } from '~/support/getSessionId';
import { HttpError } from '~/support/HttpError';
import { openai } from '~/support/openai';
import { toJsonSchema } from '~/support/toJsonSchema';

// Default number of stories to generate
const defaultCount = 6;

const inputSchema = v.union([
  v.object({
    type: v.literal('AI'),
    count: v.optional(v.number()),
  }),
  v.object({
    type: v.literal('CUSTOM'),
    description: v.string(),
  }),
]);

function parseBody(body: unknown) {
  try {
    return v.parse(inputSchema, body);
  } catch (error) {
    throw new HttpError(400, 'Invalid request body');
  }
}

const basePrompt = `
Generate {count} story idea(s) for kids stories.
For each idea write a title and a short description of the story that could be given to an LLM to generate the full story.
Also generate a prompt for a cover image for this story.
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

export async function generateStories(request: Request) {
  const input = parseBody(await request.json());
  const count = input.type === 'AI' ? input.count ?? defaultCount : 1;
  let prompt = basePrompt.replace('{count}', String(count));
  if (input.type === 'CUSTOM') {
    prompt += `\nThe story idea should be based on the following high-level description: ${input.description}`;
  }

  const sessionId = getSessionId(request);
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
  for (const { title, description, imagePrompt } of result.ideas) {
    const id = generateId(now);
    const story: InsertStoryInput = {
      id,
      title,
      description,
      imagePrompt,
      createdBy: sessionId,
    };
    // TODO: Kick off the image/content generation
    await db.insert(storiesTable).values(story);
  }
}
