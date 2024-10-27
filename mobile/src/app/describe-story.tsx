import { useEffect, useRef, useState } from 'react';
import type { TextInput } from 'react-native';
import { Alert } from 'react-native';
import { useMutation, useQuery } from '@tanstack/react-query';
import { router, Stack } from 'expo-router';
import Animated, { useAnimatedKeyboard } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import {
  Button,
  H2,
  ScrollView,
  Spinner,
  Text,
  TextArea,
  YStack,
} from '~/components/core';
import { api } from '~/support/api';

async function getSuggestedDescriptions() {
  const response = await api.get('/stories/suggestions');
  const data = await response.json();
  return Array.isArray(data)
    ? data.filter((item): item is string => typeof item === 'string')
    : [];
}

async function generateStory(description: string) {
  const response = await api.post('/stories/generate', {
    body: { type: 'CUSTOM', description },
  });
  const result = Object(await response.json());
  if (!result.success) {
    const { error } = result;
    throw new Error(typeof error === 'string' ? error : t('Unexpected error'));
  }
  return { success: true as const };
}

function DescribeStoryForm(props: { suggestions: Array<string> }) {
  const { suggestions } = props;
  const safeAreaInsets = useSafeAreaInsets();
  const keyboard = useAnimatedKeyboard();
  const inputRef = useRef<TextInput | null>(null);
  const [description, setDescription] = useState(() => {
    const i = Math.floor(Math.random() * suggestions.length);
    return suggestions[i] ?? '';
  });
  const { mutate: send, isPending: isSubmitting } = useMutation({
    mutationFn: () => generateStory(description),
    onSuccess: () => {
      router.navigate({ pathname: '/', params: { refresh: 'true' } });
    },
    onError: (error) => {
      Alert.alert(t('Error'), String(error));
    },
  });

  const submit = () => {
    inputRef.current?.blur();
    send();
  };

  // Set the initial selection
  useEffect(() => {
    inputRef.current?.setSelection(0, description.length);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <ScrollView
      flex={1}
      keyboardDismissMode="interactive"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={{
        flexGrow: 1,
        paddingHorizontal: '$3',
        gap: '$3',
      }}
    >
      <YStack py="$3" gap="$3">
        <H2 fontSize="$8">{t('Description')}</H2>
        <Text>
          {t(
            `Write a one or two sentence description of the story you'd like to see and we'll make it come to life.`,
          )}
        </Text>
      </YStack>
      <TextArea
        ref={inputRef}
        placeholder={t('Describe your story')}
        minHeight={180}
        autoFocus={true}
        disabled={isSubmitting}
        defaultValue={description}
        onChangeText={(text) => {
          setDescription(text);
        }}
      />
      <YStack flex={1} />
      <Button theme="blue" disabled={isSubmitting} onPress={() => submit()}>
        {isSubmitting ? <Spinner /> : t('Create Story')}
      </Button>
      <YStack minHeight={safeAreaInsets.bottom}>
        <Animated.View style={{ height: keyboard.height }} />
      </YStack>
    </ScrollView>
  );
}

export default function DescribeStory() {
  const { data, isFetching } = useQuery({
    queryKey: ['getSuggestedDescriptions'],
    queryFn: getSuggestedDescriptions,
    refetchOnWindowFocus: false,
  });
  return (
    <>
      <Stack.Screen options={{ title: t('My Story') }} />
      {isFetching && !data ? (
        <YStack flex={1} ai="center" jc="center">
          <Spinner />
        </YStack>
      ) : (
        <DescribeStoryForm suggestions={data ?? []} />
      )}
    </>
  );
}
