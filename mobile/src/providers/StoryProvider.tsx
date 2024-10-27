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
  | { name: 'LOADING'; isRefetch: boolean }
  | { name: 'ERROR'; error: Error }
  | { name: 'LOADED'; stories: Array<Story> };

type StoryContext = {
  state: StoryContextState;
  isRefetching: boolean;
  refetch: () => void;
  setStories: (updater: (stories: Array<Story>) => Array<Story>) => void;
  generateMoreStories: () => void;
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
    isRefetch: false,
  });

  const fetchStories = useCallback((opts: { isRefetch: boolean }) => {
    const { isRefetch } = opts;
    setState({ name: 'LOADING', isRefetch });
    return getStories()
      .then((stories) => {
        if (isMountedRef.current) {
          setState({ name: 'LOADED', stories });
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
    void fetchStories({ isRefetch: false });
    return () => {
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const refetch = useCallback(() => {
    void fetchStories({ isRefetch: true });
  }, [fetchStories]);

  const [generateMoreStories, { isGenerating }] = useGenerateStories({
    onSuccess: () => {
      // TODO: Refresh gracefully, with some indicator but not unmounting the list.
      refetch();
    },
  });

  const setStories = useCallback(
    (updater: (stories: Array<Story>) => Array<Story>) => {
      setState((state) => {
        if (state.name === 'LOADED') {
          const newStories = updater(state.stories);
          return { name: 'LOADED', stories: newStories };
        }
        return state;
      });
    },
    [],
  );

  const isRefetching = state.name === 'LOADING' && state.isRefetch;

  const contextValue: StoryContext = {
    state,
    isRefetching,
    refetch,
    setStories,
    generateMoreStories,
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
