import type { ReactNode } from 'react';

import { FontProvider } from './FontProvider';
import { ReactQueryProvider } from './ReactQueryProvider';
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
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </ThemeProvider>
    </FontProvider>
  );
}
