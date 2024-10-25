import type { ViewProps } from 'react-native';
import { BlurView } from 'expo-blur';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { StackProps } from 'tamagui';
import { H1, YStack } from 'tamagui';

type Props = StackProps & {
  title: string;
  onLayout?: ViewProps['onLayout'];
};

export function PageHeader(props: Props) {
  const { title, ...otherProps } = props;
  const safeAreaInsets = useSafeAreaInsets();
  return (
    <YStack height={0} zIndex={1}>
      <YStack position="absolute" top={0} left={0} right={0}>
        <BlurView
          intensity={70}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
        <YStack
          paddingTop={safeAreaInsets.top}
          paddingHorizontal="$3"
          {...otherProps}
        >
          <H1 fontSize="$9">{title}</H1>
        </YStack>
      </YStack>
    </YStack>
  );
}
