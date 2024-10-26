import type { ReactNode } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

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
      <GestureHandlerRootView style={{ flex: 1 }}>
        <ThemeProvider>
          <ReactQueryProvider>
            <StoryProvider>{children}</StoryProvider>
          </ReactQueryProvider>
        </ThemeProvider>
      </GestureHandlerRootView>
    </FontProvider>
  );
}
