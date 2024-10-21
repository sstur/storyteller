import { Stack, useLocalSearchParams } from 'expo-router';

import { StoryView } from '~/components/StoryView';
import { useStoryContext } from '~/providers/StoryProvider';

function StoryContent() {
  const params = useLocalSearchParams();
  const storyId = String(params.id ?? '');
  const { state } = useStoryContext();
  const stories = state.name === 'LOADED' ? state.stories : [];
  const story = stories.find((s) => s.id === storyId);
  if (!story) {
    return null;
  }
  return <StoryView story={story} />;
}

export default function Story() {
  return (
    <>
      <Stack.Screen options={{ title: t('Story') }} />
      <StoryContent />
    </>
  );
}
