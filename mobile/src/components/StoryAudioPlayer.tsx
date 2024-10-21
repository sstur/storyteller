import { useQuery } from '@tanstack/react-query';

import { Spinner, Text, YStack } from '~/components/core';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

import { AudioPlayer } from './AudioPlayer';

async function getStoryAudioStatus(id: string) {
  const url = new URL(`/stories/${id}/audio/status`, API_BASE_URL);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  const status = String(Object(data).status);
  return { status };
}

type Props = {
  story: Story;
};

export function StoryAudioPlayer(props: Props) {
  const { story } = props;
  const { status, error } = useQuery({
    queryKey: ['getStoryAudioStatus', story.id],
    queryFn: () => getStoryAudioStatus(story.id),
  });
  if (status === 'error') {
    return (
      <YStack>
        <Text>{String(error)}</Text>
      </YStack>
    );
  }

  if (status === 'pending') {
    return (
      <YStack ai="center" jc="center">
        <Spinner />
      </YStack>
    );
  }

  return (
    <AudioPlayer
      id={story.id}
      uri={`${API_BASE_URL}/stories/${story.id}/audio`}
    />
  );
}
