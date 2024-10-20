import { useQuery } from '@tanstack/react-query';

import { Image, Spinner, Text, YStack } from '~/components/core';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

async function getStoryImageUrl(id: string) {
  const url = new URL(`/stories/${id}/images/cover`, API_BASE_URL);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  const imageUrl = String(Object(data).imageUrl);
  return { imageUrl };
}

type Props = {
  story: Story;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
};

export function StoryImage(props: Props) {
  const { story, ...otherProps } = props;
  const { data, status, error } = useQuery({
    queryKey: ['getStoryImageUrl', story.id],
    queryFn: () => getStoryImageUrl(story.id),
  });
  if (status === 'error') {
    return (
      <YStack {...otherProps}>
        <Text>{String(error)}</Text>
      </YStack>
    );
  }

  if (status === 'pending') {
    return (
      <YStack {...otherProps} ai="center" jc="center">
        <Spinner />
      </YStack>
    );
  }

  return (
    <Image {...otherProps} objectFit="cover" source={{ uri: data.imageUrl }} />
  );
}
