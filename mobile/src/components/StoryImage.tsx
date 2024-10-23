import { useState } from 'react';
import { Image } from 'expo-image';

import { Spinner, YStack } from '~/components/core';
import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

type Props = {
  story: Story;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
};

export function StoryImage(props: Props) {
  const { story, ...otherProps } = props;
  const [loaded, setLoaded] = useState(false);
  const url = new URL(`/stories/${story.id}/images/cover`, API_BASE_URL);

  return (
    <Image
      {...otherProps}
      contentFit="cover"
      source={{ uri: url.toString() }}
      onLoad={() => setLoaded(true)}
    >
      {loaded ? null : (
        <YStack height="100%" ai="center" jc="center" zIndex={-1}>
          <Spinner />
        </YStack>
      )}
    </Image>
  );
}
