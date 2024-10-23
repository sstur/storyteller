import { useQuery } from '@tanstack/react-query';

import { Spinner, Text, YStack } from '~/components/core';
import { api } from '~/support/api';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

import { AudioPlayer } from './AudioPlayer';

async function getStoryAudioStatus(id: string) {
  const response = await api.get(`/stories/${id}/audio/status`);
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
