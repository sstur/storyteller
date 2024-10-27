import { Fragment } from 'react';
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
import { api } from '~/support/api';
import type { FullStory } from '~/types/FullStory';
import type { Story } from '~/types/Story';

import { StoryAudioPlayer } from './StoryAudioPlayer';
import { StoryImage } from './StoryImage';

async function getStory(id: string) {
  const response = await api.get(`/stories/${id}/content`);
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as FullStory;
}

function StoryContent(props: { story: Story }) {
  const { story } = props;

  const { data, status, error, refetch } = useQuery({
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
  if (status === 'pending') {
    return <Spinner />;
  }

  return (
    <YStack gap="$3">
      {data.content.map((block, i) => (
        <Fragment key={i}>
          {block.type === 'paragraph' ? (
            <Text fontSize="$5">{block.text}</Text>
          ) : (
            <StoryImage src={block.src} aspectRatio={16 / 9} width="100%" />
          )}
        </Fragment>
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
      <StoryImage
        src={`/stories/${story.id}/images/cover`}
        aspectRatio={16 / 9}
        width="100%"
      />
      <StoryAudioPlayer story={story} />
      <StoryContent story={story} />
    </ScrollView>
  );
}
