import { Fragment, useState } from 'react';
import { RefreshControl } from 'react-native';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  ScrollView,
  Separator,
  Spinner,
  Text,
  XStack,
  YStack,
} from '~/components/core';
import { PageHeader } from '~/components/PageHeader';
import { StoryImage } from '~/components/StoryImage';
import { useStoryContext } from '~/providers/StoryProvider';
import type { Story } from '~/types/Story';

function StoryCard(props: { story: Story; onStoryPress: () => void }) {
  const { story, onStoryPress } = props;
  return (
    <YStack gap="$2">
      <Text numberOfLines={1} fontWeight="bold" fontSize="$5">
        {story.title}
      </Text>
      <XStack gap="$3" onPress={() => onStoryPress()}>
        <StoryImage
          src={`/stories/${story.id}/images/cover`}
          aspectRatio={1}
          width={100}
        />
        <YStack flex={1}>
          <Text numberOfLines={4}>{story.description}</Text>
        </YStack>
      </XStack>
    </YStack>
  );
}

function StoryListContent(props: { onStoryPress: (story: Story) => void }) {
  const { onStoryPress } = props;
  const { state, refetch, isRefetching } = useStoryContext();

  if (state.name === 'ERROR') {
    return (
      <YStack gap="$3">
        <Text>{String(state.error)}</Text>
        <Button onPress={() => refetch()}>{t('Refresh')}</Button>
      </YStack>
    );
  }
  if (state.name === 'LOADING') {
    // Don't show double spinner when pull to refresh
    return isRefetching ? null : <Spinner />;
  }
  return (
    <YStack gap="$3">
      {state.stories.map((story, i) => (
        <Fragment key={story.id}>
          {i !== 0 ? <Separator /> : null}
          <StoryCard story={story} onStoryPress={() => onStoryPress(story)} />
        </Fragment>
      ))}
    </YStack>
  );
}

function EmptyState() {
  return (
    <YStack flex={1} jc="center" ai="center">
      <Text>{t('No stories')}</Text>
    </YStack>
  );
}

export default function StoryList() {
  const safeAreaInsets = useSafeAreaInsets();
  const { state, refetch, isRefetching } = useStoryContext();
  const [headerHeight, setHeaderHeight] = useState(0);

  const isEmpty = state.name === 'LOADED' && state.stories.length === 0;

  return (
    <>
      <Stack.Screen
        options={{
          title: t('Home'),
          headerShown: false,
        }}
      />
      <PageHeader
        title={t('Stories')}
        opacity={state.name === 'LOADED' && state.stories.length > 0 ? 1 : 0}
        onLayout={(event) => {
          setHeaderHeight(event.nativeEvent.layout.height);
        }}
      />
      <ScrollView
        flex={1}
        automaticallyAdjustsScrollIndicatorInsets={false}
        scrollIndicatorInsets={{
          top: headerHeight,
          bottom: safeAreaInsets.bottom,
        }}
        contentContainerStyle={{
          flexGrow: 1,
          paddingTop: headerHeight,
          paddingBottom: safeAreaInsets.bottom,
          paddingHorizontal: '$3',
        }}
        refreshControl={
          <RefreshControl
            refreshing={isRefetching}
            onRefresh={() => refetch()}
            progressViewOffset={headerHeight}
          />
        }
      >
        {isEmpty ? (
          <EmptyState />
        ) : (
          <StoryListContent
            onStoryPress={(story) => {
              router.push({ pathname: '/story', params: { id: story.id } });
            }}
          />
        )}
      </ScrollView>
    </>
  );
}
