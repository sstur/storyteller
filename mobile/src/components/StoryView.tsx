import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  H3,
  ScrollView,
  Spinner,
  Text,
  YStack,
} from '~/components/core';
import { API_BASE_URL } from '~/support/constants';
import type { FullStory } from '~/types/FullStory';
import type { Story } from '~/types/Story';

import { StoryAudioPlayer } from './StoryAudioPlayer';
import { StoryImage } from './StoryImage';

async function getStory(id: string) {
  const url = new URL(`/stories/${id}/content`, API_BASE_URL);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as FullStory;
}

function StoryContent(props: { story: Story }) {
  const { story } = props;

  const { data, status, error, refetch, isRefetching } = useQuery({
    queryKey: ['getStory', story.id],
    queryFn: () => getStory(story.id),
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
      {data.paragraphs.map((text, i) => (
        <Text key={i} fontSize="$5">
          {text}
        </Text>
      ))}
    </YStack>
  );
}

export function StoryView(props: { story: Story }) {
  const { story } = props;
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <ScrollView
      flex={1}
      contentContainerStyle={{
        paddingBottom: safeAreaInsets.bottom,
        paddingHorizontal: '$3',
        gap: '$3',
      }}
    >
      <H3 fontSize="$7" pt="$2">
        {story.title}
      </H3>
      <StoryImage aspectRatio={16 / 9} width="100%" story={story} />
      <StoryAudioPlayer story={story} />
      <StoryContent story={story} />
    </ScrollView>
  );
}
