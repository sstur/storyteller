import OpenAI from 'openai';

import { OPENAI_API_KEY } from '~/support/constants';

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
  organization: 'org-6CfBKThygFpUJ8lrfQM8zReY',
  project: 'proj_BIqjzbCztprpxB4F8RU58NN9',
});
