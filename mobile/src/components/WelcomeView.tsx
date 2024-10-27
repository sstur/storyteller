import { router } from 'expo-router';

import { Button, H1, Text, YStack } from '~/components/core';
import { useStoryContext } from '~/providers/StoryProvider';

export function WelcomeView() {
  const { generateMoreStories } = useStoryContext();
  return (
    <YStack minHeight="40%" jc="center" ai="center" px="$3" gap="$3">
      <H1 fontSize="$9">{t('Welcome')}</H1>
      <Text>{t("Let's create some stories.")}</Text>
      <Button
        theme="blue"
        alignSelf="stretch"
        onPress={() => {
          generateMoreStories();
        }}
      >
        {t('Generate stories with AI')}
      </Button>
      <Button
        theme="blue"
        alignSelf="stretch"
        onPress={() => {
          router.push({ pathname: '/describe-story' });
        }}
      >
        {t('Create My Own Story')}
      </Button>
    </YStack>
  );
}
