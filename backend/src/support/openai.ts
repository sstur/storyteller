import OpenAI from 'openai';

import { OPENAI_API_KEY } from '~/support/constants';

export const openai = new OpenAI({
  apiKey: OPENAI_API_KEY,
});
