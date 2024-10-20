import { toJsonSchema as toJsonSchemaValibot } from '@valibot/to-json-schema';
import type * as v from 'valibot';

export function toJsonSchema(
  schema: v.BaseSchema<unknown, unknown, v.BaseIssue<unknown>>,
): Record<string, unknown> {
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return toJsonSchemaValibot(schema) as never;
}
