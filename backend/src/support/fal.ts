import { fal } from '@fal-ai/client';

import { FAL_KEY } from './constants';

fal.config({
  credentials: FAL_KEY,
});

export { fal };
