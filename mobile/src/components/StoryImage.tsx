import { useState } from 'react';
import { Image } from 'expo-image';

import { Spinner, YStack } from '~/components/core';
import { API_BASE_URL } from '~/support/constants';

type Props = {
  src: string;
  width?: number | string;
  height?: number | string;
  aspectRatio?: number;
};

export function StoryImage(props: Props) {
  const { src, ...otherProps } = props;
  const [loaded, setLoaded] = useState(false);

  return (
    <Image
      {...otherProps}
      contentFit="cover"
      source={{ uri: new URL(src, API_BASE_URL).toString() }}
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
