import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { FullScreenLoadingModal } from '~/components/FullScreenLoadingModal';
import { useGenerateStories } from '~/hooks/useGenerateStories';
import { api } from '~/support/api';
import type { Story } from '~/types/Story';

type StoryContextState =
  | { name: 'LOADING'; fetchStarted: boolean }
  | { name: 'ERROR'; error: Error }
  | { name: 'LOADED'; stories: Array<Story>; isRefetching: boolean };

type StoryContext = {
  state: StoryContextState;
  refetch: () => void;
  setStories: (updater: (stories: Array<Story>) => Array<Story>) => void;
  generateStories: () => void;
};

const Context = createContext<StoryContext | null>(null);

async function getStories() {
  const response = await api.get('/stories');
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = Object(await response.json());
  if (!data.success) {
    const { error } = data;
    throw new Error(typeof error === 'string' ? error : 'Unexpected error');
  }
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data.stories as Array<Story>;
}

export function StoryProvider(props: { children: ReactNode }) {
  const isMountedRef = useRef(true);

  const [state, setState] = useState<StoryContextState>({
    name: 'LOADING',
    fetchStarted: false,
  });
  const stateRef = useRef(state);
  useEffect(() => {
    stateRef.current = state;
  }, [state]);

  const fetchStories = useCallback(() => {
    const state = stateRef.current;
    // Don't start a new fetch if one is in progress
    if (
      (state.name === 'LOADING' && state.fetchStarted) ||
      (state.name === 'LOADED' && state.isRefetching)
    ) {
      return;
    }
    if (state.name === 'LOADED') {
      const { stories } = state;
      setState({ name: 'LOADED', stories, isRefetching: true });
    } else {
      setState({ name: 'LOADING', fetchStarted: true });
    }
    getStories()
      .then((stories) => {
        if (isMountedRef.current) {
          setState({ name: 'LOADED', stories, isRefetching: false });
        }
      })
      .catch((e) => {
        if (isMountedRef.current) {
          const error = e instanceof Error ? e : new Error(String(e));
          setState({ name: 'ERROR', error });
        }
      });
  }, []);

  useEffect(() => {
    fetchStories();
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const setStories = useCallback(
    (updater: (stories: Array<Story>) => Array<Story>) => {
      setState((state) => {
        if (state.name === 'LOADED') {
          const { stories, isRefetching } = state;
          const newStories = updater(stories);
          return { name: 'LOADED', stories: newStories, isRefetching };
        }
        return state;
      });
    },
    [],
  );

  const [generateStories, { isGenerating }] = useGenerateStories({
    onSuccess: (stories) => {
      setStories(() => stories);
    },
  });

  const contextValue: StoryContext = {
    state,
    refetch: fetchStories,
    setStories,
    generateStories,
  };
  return (
    <Context.Provider value={contextValue}>
      <FullScreenLoadingModal visible={isGenerating} />
      {props.children}
    </Context.Provider>
  );
}

export function useStoryContext() {
  const context = useContext(Context);
  if (context === null) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
}
