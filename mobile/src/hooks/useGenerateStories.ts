import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import { api } from '~/support/api';

async function generateStories() {
  const response = await api.post('/stories/generate', {
    body: { type: 'AI' },
  });
  const result = Object(await response.json());
  if (!result.success) {
    const { error } = result;
    throw new Error(typeof error === 'string' ? error : t('Unexpected error'));
  }
  return { success: true as const };
}

type Options = {
  onSuccess: () => void;
};

export function useGenerateStories(options: Options) {
  const { onSuccess } = options;
  const { mutate, isPending: isGenerating } = useMutation({
    mutationFn: generateStories,
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      Alert.alert(t('Error'), String(error));
    },
  });
  return [mutate, { isGenerating }] as const;
}
