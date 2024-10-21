import { useEffect, useState } from 'react';
import { Play, Square } from '@tamagui/lucide-icons';
import { Audio } from 'expo-av';

import { Button, Spinner, Text, YStack } from '~/components/core';

type State =
  | { name: 'IDLE' }
  | { name: 'LOADING' }
  | { name: 'ERROR'; error: unknown }
  | { name: 'STARTING_PLAYBACK'; sound: Audio.Sound }
  | { name: 'PLAYING'; sound: Audio.Sound }
  | { name: 'STOPPING' };

export function AudioPlayer(props: { uri: string }) {
  const { uri } = props;
  const [state, setState] = useState<State>({ name: 'IDLE' });

  const play = async () => {
    console.log('>> 1');
    setState({ name: 'LOADING' });
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      (status) => {
        console.log({ status });
      },
      false,
    );
    console.log('>> 2');
    setState({ name: 'STARTING_PLAYBACK', sound });
    await sound.playAsync();
    console.log('>> 3');
    setState({ name: 'PLAYING', sound });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stop = async () => {
    if (state.name === 'STARTING_PLAYBACK' || state.name === 'PLAYING') {
      const { sound } = state;
      setState({ name: 'STOPPING' });
      await sound.unloadAsync();
      setState({ name: 'IDLE' });
    }
  };

  useEffect(() => {
    return () => {
      void stop();
    };
  }, [stop]);

  return (
    <YStack>
      {state.name === 'ERROR' ? (
        <Text>{String(state.error)}</Text>
      ) : state.name === 'LOADING' ||
        state.name === 'STARTING_PLAYBACK' ||
        state.name === 'STOPPING' ? (
        <Spinner />
      ) : state.name === 'PLAYING' ? (
        <Button onPress={() => stop()}>{t('Stop')}</Button>
      ) : (
        <Button onPress={() => play()}>{t('Play')}</Button>
      )}
    </YStack>
  );
}
