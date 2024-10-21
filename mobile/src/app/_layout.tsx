import { SplashScreen, Stack } from 'expo-router';
import { useTheme } from 'tamagui';

import { AppProvider } from '~/providers/AppProvider';

void SplashScreen.preventAutoHideAsync();

function RootContent() {
  const theme = useTheme();

  return (
    <Stack
      screenOptions={{
        headerTintColor: theme.color.get(),
        headerTitleStyle: {
          fontFamily: 'InterSemiBold',
        },
        headerBackTitleVisible: false,
        contentStyle: {
          backgroundColor: theme.pageBackground.get(),
        },
      }}
    />
  );
}

export default function RootLayout() {
  return (
    <AppProvider onInitialized={() => SplashScreen.hideAsync()}>
      <RootContent />
    </AppProvider>
  );
}
