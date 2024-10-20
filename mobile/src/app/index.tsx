import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  Image,
  ScrollView,
  Spinner,
  Text,
  XStack,
  YStack,
} from '~/components/core';
import { StoryView } from '~/components/StoryView';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

const THUMBNAIL_SIZE = 100;

async function getStories() {
  const response = await fetch(API_BASE_URL + '/stories/generate');
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as Array<Story>;
}

async function getStoryImageUrl(prompt: string) {
  const url = new URL('/stories/images/generate', API_BASE_URL);
  url.searchParams.set('prompt', prompt);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  const imageUrl = String(Object(data).imageUrl);
  return { imageUrl };
}

function StoryImage(props: { story: Story }) {
  const { story } = props;
  const { data, status, error } = useQuery({
    queryKey: ['getStoryImageUrl', story.id],
    queryFn: () => getStoryImageUrl(story.imagePrompt),
  });
  if (status === 'error') {
    return (
      <YStack w={THUMBNAIL_SIZE} h={THUMBNAIL_SIZE}>
        <Text>{String(error)}</Text>
      </YStack>
    );
  }

  if (status === 'pending') {
    return (
      <YStack w={THUMBNAIL_SIZE} h={THUMBNAIL_SIZE} ai="center" jc="center">
        <Spinner />
      </YStack>
    );
  }

  return (
    <Image
      width={THUMBNAIL_SIZE}
      height={THUMBNAIL_SIZE}
      objectFit="cover"
      source={{ uri: data.imageUrl }}
    />
  );
}

function StoryCard(props: { story: Story; onStoryPress: () => void }) {
  const { story, onStoryPress } = props;

  return (
    <XStack gap="$3" onPress={() => onStoryPress()}>
      <StoryImage story={story} />
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

  if (selectedStory) {
    return (
      <StoryView
        story={selectedStory}
        onBackPress={() => setSelectedStory(null)}
      />
    );
  }

  return (
    <ScrollView
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
  );
}
