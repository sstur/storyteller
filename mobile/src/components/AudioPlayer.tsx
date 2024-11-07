import type { MutableRefObject } from 'react';
import {
  useCallback,
  useEffect,
  useRef,
  useState as useStateReact,
} from 'react';
import {
  Pause as IconPause,
  Play as IconPlay,
  Square as IconStop,
} from '@tamagui/lucide-icons';
import type { AVPlaybackStatus } from 'expo-av';
import { Audio } from 'expo-av';

import type { ButtonProps } from '~/components/core';
import { Button, Spinner, Text, XStack, YStack } from '~/components/core';

type State =
  | { name: 'INITIALIZING' }
  | { name: 'STOPPED' }
  | { name: 'STARTING_PLAYBACK' }
  | { name: 'ERROR'; error: unknown }
  | { name: 'PLAYING' }
  | { name: 'PAUSING' }
  | { name: 'PAUSED' }
  | { name: 'RESUMING' }
  | { name: 'STOPPING' };

type Props = { id: string; uri: string; duration: number };

function useState<T>(stateRef: MutableRefObject<T>) {
  const [state, setState] = useStateReact(() => {
    return stateRef.current;
  });
  const setStateWithRef = useCallback(
    (value: T) => {
      stateRef.current = value;
      setState(value);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return [state, setStateWithRef] as const;
}

export function AudioPlayer(props: Props) {
  const { uri, duration } = props;
  const [sound] = useStateReact(() => new Audio.Sound());
  const soundRef = useRef(sound);

  const stateRef = useRef<State>({ name: 'INITIALIZING' });
  const [state, setState] = useState(stateRef);
  const [position, setPosition] = useState({ current: 0 });

  const play = useCallback(async () => {
    const sound = soundRef.current;
    const state = stateRef.current;
    if (state.name !== 'PAUSED' && state.name !== 'STOPPED') {
      return;
    }
    try {
      setState({ name: 'STARTING_PLAYBACK' });
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        playsInSilentModeIOS: true,
      });
      const status = await sound.playAsync();
      if (status.isLoaded && status.isPlaying) {
        setState({
          name: 'PLAYING',
        });
      }
    } catch (error) {
      setState({ name: 'ERROR', error });
    }
  }, []);

  const pause = useCallback(async () => {
    const sound = soundRef.current;
    const state = stateRef.current;
    if (state.name !== 'PLAYING') {
      return;
    }
    setState({ name: 'PAUSING' });
    await sound.pauseAsync();
    setState({ name: 'PAUSED' });
  }, []);

  const resume = useCallback(async () => {
    const sound = soundRef.current;
    const state = stateRef.current;
    if (state.name !== 'PAUSED') {
      return;
    }
    try {
      setState({ name: 'RESUMING' });
      const status = await sound.playAsync();
      if (status.isLoaded && status.isPlaying) {
        setState({ name: 'PLAYING' });
      }
    } catch (error) {
      setState({ name: 'ERROR', error });
    }
  }, []);

  const stop = useCallback(async () => {
    const sound = soundRef.current;
    const state = stateRef.current;
    if (state.name === 'PLAYING' || state.name === 'PAUSED') {
      setState({ name: 'STOPPING' });
      try {
        await sound.stopAsync();
      } finally {
        setState({ name: 'STOPPED' });
      }
    }
  }, []);

  const onPlaybackStatusUpdate = useCallback(
    (status: AVPlaybackStatus) => {
      if (!status.isLoaded) {
        return;
      }
      const state = stateRef.current;
      setPosition(status.positionMillis);

      const isStartingPlayback = state.name === 'STARTING_PLAYBACK';
      const isResumingPlayback = state.name === 'RESUMING';
      if ((isStartingPlayback || isResumingPlayback) && status.isPlaying) {
        setState({ name: 'PLAYING' });
        return;
      }

      if (state.name === 'PLAYING' && !status.isPlaying) {
        // Playback is complete
        void stop();
        return;
      }

      if (state.name === 'PLAYING') {
        setState({ name: 'PLAYING' });
        return;
      }
    },
    [stop],
  );

  useEffect(() => {
    const sound = soundRef.current;
    sound.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
    sound
      .loadAsync({ uri })
      .then(() => {
        setState({ name: 'STOPPED' });
      })
      .catch((error) => {
        setState({ name: 'ERROR', error });
      });
    const unload = async () => {
      const state = stateRef.current;
      try {
        if (state.name === 'PLAYING' || state.name === 'PAUSED') {
          await sound.stopAsync();
        }
      } finally {
        void sound.unloadAsync();
      }
    };
    return () => {
      void unload();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    // TODO:
    // state.name === 'STARTING_PLAYBACK'
    // state.name === 'PAUSING'
    // state.name === 'RESUMING'
    // state.name === 'STOPPING'
    <YStack>
      {state.name === 'ERROR' ? (
        <Text>{String(state.error)}</Text>
      ) : state.name === 'INITIALIZING' ? (
        <Spinner />
      ) : state.name === 'PLAYING' ? (
        <XStack gap="$3">
          <IconButton
            label={t('Pause')}
            icon={<IconPause />}
            onPress={() => pause()}
          />
          <XStack flex={1} jc="center" ai="center">
            <Text>{formatProgress(position, duration)}</Text>
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
            onPress={() => resume()}
          />
          <XStack flex={1} jc="center" ai="center">
            <Text>{formatProgress(position, duration)}</Text>
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
