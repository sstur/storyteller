import { Fragment, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { MoreVertical } from '@tamagui/lucide-icons';
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
import { DropdownMenu } from '~/components/DropdownMenu';
import { HeaderButton, PageHeader } from '~/components/PageHeader';
import { StoryImage } from '~/components/StoryImage';
import { SwipeableRow } from '~/components/SwipeableRow';
import { WelcomeView } from '~/components/WelcomeView';
import { useStoryContext } from '~/providers/StoryProvider';
import type { Story } from '~/types/Story';

function StoryCard(props: { story: Story; onStoryPress: () => void }) {
  const { story, onStoryPress } = props;
  return (
    <SwipeableRow
      actionRight={{
        title: t('Delete'),
        onPress: () => {
          Alert.alert(t('Delete Story'));
        },
        outerViewStyle: {
          backgroundColor: 'white',
        },
        viewProps: {
          bg: 'red',
          pressStyle: {
            opacity: 0.6,
          },
        },
        textProps: {
          color: 'white',
        },
      }}
    >
      <YStack px="$3" gap="$2">
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
    </SwipeableRow>
  );
}

function StoryListContent(props: { onStoryPress: (story: Story) => void }) {
  const { onStoryPress } = props;
  const { state, refetch, isRefetching } = useStoryContext();

  if (state.name === 'ERROR') {
    return (
      <YStack px="$3" gap="$3">
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
          {i !== 0 ? <Separator mx="$3" /> : null}
          <StoryCard story={story} onStoryPress={() => onStoryPress(story)} />
        </Fragment>
      ))}
    </YStack>
  );
}

export default function StoryList() {
  const safeAreaInsets = useSafeAreaInsets();
  const { state, refetch, isRefetching } = useStoryContext();
  const [headerHeight, setHeaderHeight] = useState(0);

  const isEmpty = state.name === 'LOADED' && state.stories.length === 0;
  const showHeader = state.name === 'LOADED' && state.stories.length > 0;

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
        hidden={!showHeader}
        onLayout={(event) => {
          setHeaderHeight(event.nativeEvent.layout.height);
        }}
        itemRight={
          <DropdownMenu
            trigger={<HeaderButton icon={MoreVertical} />}
            items={[
              {
                label: t('Create Story'),
                onClick: () => {
                  router.push({ pathname: '/create-story' });
                },
              },
            ]}
          />
        }
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
          <WelcomeView />
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
