import type { ViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type { StackProps } from '~/components/core';
import { H1, YStack } from '~/components/core';

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
        <YStack
          position="absolute"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="$pageBackground"
          opacity={0.85}
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
