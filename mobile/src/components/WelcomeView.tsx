import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';

import { Button, H1, Spinner, Text, YStack } from '~/components/core';
import { useStoryContext } from '~/providers/StoryProvider';
import { api } from '~/support/api';

async function generateStories() {
  const response = await api.post('/stories/generate');
  const result = Object(await response.json());
  if (!result.success) {
    const { error } = result;
    throw new Error(typeof error === 'string' ? error : t('Unexpected error'));
  }
  return { success: true as const };
}

export function WelcomeView() {
  const { refetch } = useStoryContext();
  const { mutate, isPending } = useMutation({
    mutationFn: generateStories,
    onSuccess: () => {
      refetch();
    },
    onError: (error) => {
      Alert.alert(t('Error'), String(error));
    },
  });

  return (
    <YStack minHeight="40%" jc="center" ai="center" px="$3" gap="$3">
      <H1 fontSize="$9">{t('Welcome')}</H1>
      <Text>{t("Let's create your first story.")}</Text>
      <Button
        theme="blue"
        alignSelf="stretch"
        disabled={isPending}
        onPress={() => mutate()}
      >
        {isPending ? <Spinner /> : t('Create story')}
      </Button>
    </YStack>
  );
}
