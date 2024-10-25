import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Pause as IconPause,
  Play as IconPlay,
  Square as IconStop,
} from '@tamagui/lucide-icons';
import { Audio } from 'expo-av';

import type { ButtonProps } from '~/components/core';
import { Button, Spinner, Text, XStack, YStack } from '~/components/core';

type State =
  | { name: 'IDLE' }
  | { name: 'STARTING_PLAYBACK' }
  | { name: 'ERROR'; error: unknown }
  | { name: 'PLAYING'; sound: Audio.Sound; position: number }
  | { name: 'PAUSED'; sound: Audio.Sound; position: number }
  | { name: 'STOPPING' };

type Props = { id: string; uri: string; duration: number };

export function AudioPlayer(props: Props) {
  const { uri, duration } = props;
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
        setState({ name: 'PLAYING', sound, position });
        return;
      }
      setState({ name: 'STARTING_PLAYBACK' });
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const { sound, status } = await Audio.Sound.createAsync(
        { uri },
        { shouldPlay: true },
        (status) => {
          if (status.isLoaded) {
            const state = stateRef.current;

            if (state.name === 'STARTING_PLAYBACK' && status.isPlaying) {
              const position = status.positionMillis;
              setState({ name: 'PLAYING', sound, position });
              return;
            }

            if (state.name === 'PLAYING' && !status.isPlaying) {
              // Playback is complete
              void stop();
              return;
            }

            if (state.name === 'PLAYING') {
              const position = status.positionMillis;
              setState({ name: 'PLAYING', sound, position });
              return;
            }
          }
        },
        false,
      );
      if (status.isLoaded && status.isPlaying) {
        setState({
          name: 'PLAYING',
          sound,
          position: status.positionMillis,
        });
      }
    } catch (error) {
      setState({ name: 'ERROR', error });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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
          <IconButton
            label={t('Pause')}
            icon={<IconPause />}
            onPress={() => pause()}
          />
          <XStack flex={1} jc="center" ai="center">
            <Text>{formatProgress(state.position, duration)}</Text>
          </XStack>
          <IconButton
            label={t('Stop')}
            icon={<IconStop />}
            onPress={() => stop()}
          />
        </XStack>
      ) : state.name === 'PAUSED' ? (
        <XStack gap="$3">
          <IconButton
            label={t('Play')}
            icon={<IconPlay />}
            onPress={() => play()}
          />
          <XStack flex={1} jc="center" ai="center">
            <Text>{formatProgress(state.position, duration)}</Text>
          </XStack>
          <IconButton
            label={t('Stop')}
            icon={<IconStop />}
            onPress={() => stop()}
          />
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

function IconButton(props: Omit<ButtonProps, 'children'> & { label: string }) {
  const { label, ...otherProps } = props;
  return <Button aria-label={label} {...otherProps} />;
}

function formatProgress(position: number, duration: number) {
  return `${formatTime(position)} / ${formatTime(duration)}`;
}

function formatTime(ms: number) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
