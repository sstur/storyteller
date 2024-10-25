import { useQuery } from '@tanstack/react-query';

import { Spinner, Text, YStack } from '~/components/core';
import { api } from '~/support/api';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

import { AudioPlayer } from './AudioPlayer';

type AudioDetails = {
  duration: number;
};

async function getStoryAudioDetails(id: string) {
  const response = await api.get(`/stories/${id}/audio/details`);
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as AudioDetails;
}

type Props = {
  story: Story;
};

export function StoryAudioPlayer(props: Props) {
  const { story } = props;
  const { data, status, error } = useQuery({
    queryKey: ['getStoryAudioDetails', story.id],
    queryFn: () => getStoryAudioDetails(story.id),
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
      duration={data.duration}
    />
  );
}
