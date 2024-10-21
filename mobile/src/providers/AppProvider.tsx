import type { ReactNode } from 'react';

import { FontProvider } from './FontProvider';
import { ReactQueryProvider } from './ReactQueryProvider';
import { StoryProvider } from './StoryProvider';
import { ThemeProvider } from './ThemeProvider';

type Props = {
  onInitialized: () => void;
  children: ReactNode;
};

export function AppProvider(props: Props) {
  const { onInitialized, children } = props;
  return (
    <FontProvider onInitialized={onInitialized}>
      <ThemeProvider>
        <ReactQueryProvider>
          <StoryProvider>{children}</StoryProvider>
        </ReactQueryProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
