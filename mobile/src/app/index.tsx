import { Fragment, useCallback, useEffect, useRef, useState } from 'react';
import { Alert, RefreshControl } from 'react-native';
import { MoreVertical } from '@tamagui/lucide-icons';
import { useMutation } from '@tanstack/react-query';
import {
  router,
  Stack,
  useFocusEffect,
  useLocalSearchParams,
  useNavigation,
} from 'expo-router';
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
import { api } from '~/support/api';
import type { Story } from '~/types/Story';

async function deleteStory(id: string) {
  const response = await api.delete(`/stories/${id}`);
  const result = Object(await response.json());
  if (!result.success) {
    const { error } = result;
    throw new Error(typeof error === 'string' ? error : t('Unexpected error'));
  }
  return { success: true as const };
}

function StoryCard(props: { story: Story; onStoryPress: () => void }) {
  const { story, onStoryPress } = props;
  const { setStories } = useStoryContext();

  const { mutate, isPending: isDeleting } = useMutation({
    mutationFn: () => deleteStory(story.id),
    onSuccess: () => {
      setStories((stories) => stories.filter(({ id }) => id !== story.id));
    },
    onError: (error) => {
      Alert.alert(t('Error'), String(error));
    },
  });

  return (
    <SwipeableRow
      actionRight={{
        title: t('Delete'),
        isLoading: isDeleting,
        onPress: () => mutate(),
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
  const { state, refetch } = useStoryContext();
  const navigation = useNavigation();
  const params = useLocalSearchParams();
  const paramsRef = useRef(params);
  useEffect(() => {
    paramsRef.current = params;
  }, [params]);

  useFocusEffect(
    useCallback(() => {
      const params = paramsRef.current;
      if (params.refresh === 'true') {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        navigation.setParams({ refresh: 'false' } as never);
        // Adding a delay here otherwise the RefreshControl doesn't seem to render right
        setTimeout(() => {
          refetch();
        }, 500);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []),
  );

  if (state.name === 'ERROR') {
    return (
      <YStack px="$3" gap="$3">
        <Text>{String(state.error)}</Text>
        <Button onPress={() => refetch()}>{t('Retry')}</Button>
      </YStack>
    );
  }
  if (state.name === 'LOADING') {
    return (
      <YStack flex={1} jc="center" ai="center">
        <Spinner size="large" />
      </YStack>
    );
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
  const { state, refetch, generateMoreStories } = useStoryContext();
  const [headerHeight, setHeaderHeight] = useState(0);

  const isEmpty = state.name === 'LOADED' && state.stories.length === 0;
  const showHeader = state.name === 'LOADED' && state.stories.length > 0;
  const isRefetching = state.name === 'LOADED' && state.isRefetching;

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
                label: t('Generate More Stories'),
                onClick: () => {
                  generateMoreStories();
                },
              },
              {
                label: t('Create My Own Story'),
                onClick: () => {
                  router.push({ pathname: '/describe-story' });
                },
              },
              {
                label: t('Refresh'),
                onClick: () => {
                  refetch();
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
