import { RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  H1,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from '~/components/core';
import { StoryImage } from '~/components/StoryImage';
import { useStoryContext } from '~/providers/StoryProvider';
import type { Story } from '~/types/Story';

function StoryCard(props: { story: Story; onStoryPress: () => void }) {
  const { story, onStoryPress } = props;
  return (
    <YStack gap="$2">
      <Text numberOfLines={1} fontWeight="bold" fontSize="$5">
        {story.title}
      </Text>
      <XStack gap="$3" onPress={() => onStoryPress()}>
        <StoryImage aspectRatio={1} width={100} story={story} />
        <YStack flex={1}>
          <Text numberOfLines={4}>{story.description}</Text>
        </YStack>
      </XStack>
    </YStack>
  );
}

function StoryListContent(props: { onStoryPress: (story: Story) => void }) {
  const { onStoryPress } = props;
  const { state, refetch } = useStoryContext();

  if (state.name === 'ERROR') {
    return (
      <YStack gap="$3">
        <Text>{String(state.error)}</Text>
        <Button onPress={() => refetch()}>{t('Refresh')}</Button>
      </YStack>
    );
  }
  if (state.name === 'LOADING') {
    return <Spinner />;
  }
  return (
    <YStack gap="$3">
      {state.stories.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          onStoryPress={() => onStoryPress(story)}
        />
      ))}
    </YStack>
  );
}

export default function StoryList() {
  const safeAreaInsets = useSafeAreaInsets();
  const { refetch } = useStoryContext();

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Home'),
          headerShown: false,
        }}
      />
      <ScrollView
        flex={1}
        stickyHeaderIndices={[0]}
        contentContainerStyle={{
          paddingBottom: safeAreaInsets.bottom,
          paddingHorizontal: '$3',
          gap: '$3',
        }}
        refreshControl={
          <RefreshControl refreshing={false} onRefresh={() => refetch()} />
        }
      >
        <H1 fontSize="$9" paddingTop={safeAreaInsets.top} bg="$pageBackground">
          {t('Stories')}
        </H1>
        <StoryListContent
          onStoryPress={(story) => {
            router.push({ pathname: '/story', params: { id: story.id } });
          }}
        />
      </ScrollView>
    </>
  );
}
