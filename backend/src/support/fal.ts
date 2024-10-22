import { fal } from '@fal-ai/client';

import { FAL_KEY } from '~/support/constants';

fal.config({
  credentials: FAL_KEY,
});

export { fal };
