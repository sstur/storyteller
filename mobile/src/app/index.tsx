import { useQuery } from '@tanstack/react-query';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ScrollView, Spinner, Text } from '~/components/core';
import { API_BASE_URL } from '~/support/constants';

type Story = {
  title: string;
  description: string;
  imagePrompt: string;
};

async function getStories() {
  const response = await fetch(API_BASE_URL + '/story-ideas');
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as Array<Story>;
}

function StoryListContent() {
  const { data, status, error } = useQuery({
    queryKey: ['getStories'],
    queryFn: getStories,
  });

  if (status === 'error') {
    return <Text>{String(error)}</Text>;
  }
  if (status === 'pending') {
    return <Spinner />;
  }
  return (
    <>
      {data.map((story, i) => {
        return <Text key={i}>{story.title}</Text>;
      })}
    </>
  );
}

export default function StoryList() {
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
      <StoryListContent />
    </ScrollView>
  );
}
