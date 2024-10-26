import { router } from 'expo-router';

import { Button, H1, Text, YStack } from '~/components/core';

export function WelcomeView() {
  return (
    <YStack minHeight="40%" jc="center" ai="center" px="$3" gap="$3">
      <H1 fontSize="$9">{t('Welcome')}</H1>
      <Text>{t("Let's create your first story.")}</Text>
      <Button
        theme="blue"
        alignSelf="stretch"
        onPress={() => {
          router.push({ pathname: '/create-story' });
        }}
      >
        {t('Create story')}
      </Button>
    </YStack>
  );
}
