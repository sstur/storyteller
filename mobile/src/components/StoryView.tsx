import { ChevronLeft } from '@tamagui/lucide-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Button, ScrollView, Text } from '~/components/core';
import type { Story } from '~/types/Story';

export function StoryView(props: { story: Story; onBackPress: () => void }) {
  const { story, onBackPress } = props;
  const safeAreaInsets = useSafeAreaInsets();

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
      <Button
        icon={<ChevronLeft />}
        onPress={() => onBackPress()}
        alignSelf="flex-start"
      />
      <Text fontWeight="bold" fontSize="$5">
        {story.title}
      </Text>
      <Text>{story.description}</Text>
    </ScrollView>
  );
}
