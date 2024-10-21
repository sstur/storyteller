import { createContext, useContext, type ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';

import { API_BASE_URL } from '~/support/constants';
import type { Story } from '~/types/Story';

type StoryContext = {
  state:
    | { name: 'LOADING' }
    | { name: 'ERROR'; error: Error }
    | { name: 'LOADED'; stories: Array<Story> };
  isRefetching: boolean;
  refetch: () => void;
};

const Context = createContext<StoryContext | null>(null);

async function getStories() {
  const response = await fetch(API_BASE_URL + '/stories/generate');
  if (!response.ok) {
    throw new Error(`Unexpected response status: ${response.status}`);
  }
  const data = await response.json();
  // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
  return data as Array<Story>;
}

export function StoryProvider(props: { children: ReactNode }) {
  const { data, status, error, refetch, isRefetching } = useQuery({
    queryKey: ['getStories'],
    queryFn: getStories,
  });
  const contextValue: StoryContext = {
    state:
      status === 'error'
        ? { name: 'ERROR', error }
        : status === 'pending' || isRefetching
          ? { name: 'LOADING' }
          : { name: 'LOADED', stories: data },
    isRefetching,
    refetch: refetch,
  };
  return (
    <Context.Provider value={contextValue}>{props.children}</Context.Provider>
  );
}

export function useStoryContext() {
  const context = useContext(Context);
  if (context === null) {
    throw new Error('useStoryContext must be used within a StoryProvider');
  }
  return context;
}
