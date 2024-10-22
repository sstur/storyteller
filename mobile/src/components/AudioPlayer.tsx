import { useCallback, useEffect, useRef, useState } from 'react';
import { Audio } from 'expo-av';

import { Button, Spinner, Text, XStack, YStack } from '~/components/core';

type State =
  | { name: 'IDLE' }
  | { name: 'STARTING_PLAYBACK' }
  | { name: 'ERROR'; error: unknown }
  | { name: 'PLAYING'; sound: Audio.Sound }
  | { name: 'PAUSED'; sound: Audio.Sound; position: number }
  | { name: 'STOPPING' };

export function AudioPlayer(props: { id: string; uri: string }) {
  const { id, uri } = props;
  const [state, setState] = useState<State>({ name: 'IDLE' });
  const stateRef = useRef<State>(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const play = useCallback(async () => {
    const state = stateRef.current;
    try {
      if (state.name === 'PAUSED') {
        const { sound, position } = state;
        // TODO: isResuming?
        await sound.playFromPositionAsync(position);
        setState({ name: 'PLAYING', sound });
        return;
      }
      setState({ name: 'STARTING_PLAYBACK' });
      console.log('Starting audio for story:', { id });
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
      setState({
        name: 'PLAYING',
        sound,
      });
    } catch (error) {
      setState({ name: 'ERROR', error });
    }
  }, [id, uri]);

  const pause = useCallback(async () => {
    const state = stateRef.current;
    if (state.name === 'PLAYING') {
      // TODO: isPausing?
      const { sound } = state;
      const status = await sound.pauseAsync();
      const position = status.isLoaded ? status.positionMillis : 0;
      setState({ name: 'PAUSED', sound, position });
    }
  }, []);

  const stop = useCallback(async () => {
    const state = stateRef.current;
    if (state.name === 'PLAYING') {
      const { sound } = state;
      setState({ name: 'STOPPING' });
      await sound.unloadAsync();
      setState({ name: 'IDLE' });
    }
  }, []);

  useEffect(() => {
    return () => {
      const state = stateRef.current;
      if (state.name === 'PLAYING' || state.name === 'PAUSED') {
        const { sound } = state;
        void sound.unloadAsync();
      }
    };
  }, []);

  return (
    <YStack>
      {state.name === 'ERROR' ? (
        <Text>{String(state.error)}</Text>
      ) : state.name === 'STOPPING' ? (
        <Spinner />
      ) : state.name === 'PLAYING' ? (
        <XStack gap="$3">
          <Button flex={1} onPress={() => stop()}>
            {t('Stop')}
          </Button>
          <Button flex={1} onPress={() => pause()}>
            {t('Pause')}
          </Button>
        </XStack>
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
