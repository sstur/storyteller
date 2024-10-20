import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from '~/components/core';
import { StoryImage } from '~/components/StoryImage';
import { StoryView } from '~/components/StoryView';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

async function getStories() {
  const response = await fetch(API_BASE_URL + '/stories/generate');
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as Array<Story>;
}

function StoryCard(props: { story: Story; onStoryPress: () => void }) {
  const { story, onStoryPress } = props;

  return (
    <XStack gap="$3" onPress={() => onStoryPress()}>
      <StoryImage aspectRatio={1} width={100} story={story} />
      <YStack gap="$2" flex={1}>
        <Text numberOfLines={1} fontWeight="bold" fontSize="$5">
          {story.title}
        </Text>
        <Text numberOfLines={3}>{story.description}</Text>
      </YStack>
    </XStack>
  );
}

function StoryListContent(props: { onStoryPress: (story: Story) => void }) {
  const { onStoryPress } = props;
  const { data, status, error, refetch, isRefetching } = useQuery({
    queryKey: ['getStories'],
    queryFn: getStories,
  });

  if (status === 'error') {
    return (
      <YStack gap="$3">
        <Text>{String(error)}</Text>
        <Button onPress={() => refetch()}>{t('Refresh')}</Button>
      </YStack>
    );
  }
  if (status === 'pending' || isRefetching) {
    return <Spinner />;
  }
  return (
    <YStack gap="$3">
      {data.map((story) => (
        <StoryCard
          key={story.id}
          story={story}
          onStoryPress={() => onStoryPress(story)}
        />
      ))}
      <Button onPress={() => refetch()}>{t('Refresh')}</Button>
    </YStack>
  );
}

export default function StoryList() {
  const safeAreaInsets = useSafeAreaInsets();
  const [selectedStory, setSelectedStory] = useState<Story | null>(null);

  return (
    <>
      {selectedStory ? (
        <StoryView
          story={selectedStory}
          onBackPress={() => setSelectedStory(null)}
        />
      ) : null}
      <ScrollView
        display={selectedStory ? 'none' : undefined}
        flex={1}
        contentContainerStyle={{
          paddingTop: safeAreaInsets.top,
          paddingBottom: safeAreaInsets.bottom,
          paddingHorizontal: '$3',
          gap: '$3',
        }}
      >
        <StoryListContent onStoryPress={(story) => setSelectedStory(story)} />
      </ScrollView>
    </>
  );
}
