import { Image } from 'expo-image';

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
  const url = new URL(`/stories/${story.id}/images/cover`, API_BASE_URL);

  return (
    <Image
      {...otherProps}
      contentFit="cover"
      source={{ uri: url.toString() }}
    />
  );
}
