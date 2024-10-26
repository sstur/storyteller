import { Alert } from 'react-native';
import { useMutation } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';

import { Button, Spinner, YStack } from '~/components/core';
import { useStoryContext } from '~/providers/StoryProvider';
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

export default function CreateStory() {
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
    <>
      <Stack.Screen options={{ title: t('Create Story') }} />
      <YStack minHeight="40%" jc="center" ai="center" px="$3" gap="$3">
        <Button
          theme="blue"
          alignSelf="stretch"
          disabled={isPending}
          onPress={() => mutate()}
        >
          {isPending ? <Spinner /> : t('Generate Stories with AI')}
        </Button>
        <Button
          theme="blue"
          alignSelf="stretch"
          disabled={isPending}
          onPress={() => {
            router.replace({ pathname: '/describe-story' });
          }}
        >
          {t('Create My Own Story')}
        </Button>
      </YStack>
    </>
  );
}
