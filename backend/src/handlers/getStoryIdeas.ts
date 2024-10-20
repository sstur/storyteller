import * as v from 'valibot';

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

export async function getStoryIdeas(_request: Request): Promise<Response> {
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
  return Response.json(result.ideas);
}
