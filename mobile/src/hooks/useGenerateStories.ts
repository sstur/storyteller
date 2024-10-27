import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import { api } from '~/support/api';
import type { Story } from '~/types/Story';

type Result = {
  success: true;
  stories: Array<Story>;
};

async function generateStories() {
  const response = await api.post('/stories/generate', {
    body: { type: 'AI' },
  });
  const result = Object(await response.json());
  if (!result.success) {
    const { error } = result;
    throw new Error(typeof error === 'string' ? error : t('Unexpected error'));
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return result as Result;
}

type Options = {
  onSuccess: (stories: Array<Story>) => void;
};

export function useGenerateStories(options: Options) {
  const { onSuccess } = options;
  const { mutate, isPending: isGenerating } = useMutation({
    mutationFn: generateStories,
    onSuccess: (result) => {
      onSuccess(result.stories);
    },
    onError: (error) => {
      Alert.alert(t('Error'), String(error));
    },
  });
  return [mutate, { isGenerating }] as const;
}
