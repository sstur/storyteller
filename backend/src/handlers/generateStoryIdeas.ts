import * as v from 'valibot';

import { openai } from '~/support/openai';
import { store } from '~/support/store';
import { toJsonSchema } from '~/support/toJsonSchema';
import type { Story } from '~/types/Story';

const prompt = `
Generate 2 story ideas for kids stories. For each idea write a title and a short description of the story that could be given to an LLM to generate the full story. Also generate a prompt for a cover image for this story.
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
        role: 'system',
        content: 'You extract email addresses into JSON data.',
      },
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
  for (const [i, idea] of result.ideas.entries()) {
    const id = String(now + i);
    const story: Story = { id, ...idea };
    store.stories.set(id, story);
    stories.push(story);
  }
  return Response.json(stories);
}
