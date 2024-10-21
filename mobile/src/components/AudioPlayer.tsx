import { useEffect, useState } from 'react';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';

import { Button, Spinner, Text, YStack } from '~/components/core';

const documentDirectory = FileSystem.documentDirectory ?? '';

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
    const now = Date.now();
    // TODO: try/catch on all these async calls
    const localFile = await FileSystem.downloadAsync(
      uri,
      documentDirectory + `${now}-${id}.wav`,
    );
    // TODO: Cache this file so we don't download again next time
    console.log('Downloaded audio file to:', localFile.uri);
    await Audio.setAudioModeAsync({
      allowsRecordingIOS: false,
      playsInSilentModeIOS: true,
    });
    const { sound } = await Audio.Sound.createAsync(
      { uri: localFile.uri },
      { shouldPlay: true },
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
      ) : state.name === 'STARTING_PLAYBACK' || state.name === 'STOPPING' ? (
        <Spinner />
      ) : state.name === 'PLAYING' ? (
        <Button onPress={() => stop()}>{t('Stop')}</Button>
      ) : (
        <Button onPress={() => play()}>{t('Play')}</Button>
      )}
    </YStack>
  );
}
