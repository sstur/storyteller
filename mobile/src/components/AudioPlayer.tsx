import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';

import { Button, Spinner, Text, YStack } from '~/components/core';

type State =
  | { name: 'IDLE' }
  | { name: 'STARTING_PLAYBACK' }
  | { name: 'ERROR'; error: unknown }
  | { name: 'PLAYING'; sound: Audio.Sound }
  | { name: 'STOPPING' };

export function AudioPlayer(props: { id: string; uri: string }) {
  const { id, uri } = props;
  const [state, setState] = useState<State>({ name: 'IDLE' });

  const play = async () => {
    setState({ name: 'STARTING_PLAYBACK' });
    console.log('Playing audio for story:', { id });
    // TODO: try/catch on all these async calls
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri },
      { shouldPlay: true },
      null,
      false,
    );
    setState({ name: 'PLAYING', sound });
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const stop = async () => {
    if (state.name === 'PLAYING') {
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
      ) : state.name === 'STOPPING' ? (
        <Spinner />
      ) : state.name === 'PLAYING' ? (
        <Button onPress={() => stop()}>{t('Stop')}</Button>
      ) : (
        <Button
          disabled={state.name === 'STARTING_PLAYBACK'}
          onPress={() => play()}
        >
          {t('Play')}
        </Button>
      )}
    </YStack>
  );
}
