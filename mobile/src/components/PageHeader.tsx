import { forwardRef, type ComponentType, type ReactElement } from 'react';
import type { ViewProps } from 'react-native';
import type { IconProps } from '@tamagui/helpers-icon';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import type {
  ButtonProps,
  StackProps,
  TamaguiElement,
} from '~/components/core';
import { Button, H1, View, XStack, YStack } from '~/components/core';

const ACCESSORY_WIDTH = 54;

type Props = StackProps & {
  title: string;
  hidden?: boolean;
  itemRight?: ReactElement;
  onLayout?: ViewProps['onLayout'];
};

export function PageHeader(props: Props) {
  const { title, hidden, itemRight, ...otherProps } = props;
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
        <YStack paddingTop={safeAreaInsets.top} {...otherProps}>
          {hidden ? null : (
            <XStack ai="stretch">
              <YStack flex={1}>
                <H1 fontSize="$9">{title}</H1>
              </YStack>
              <View width={ACCESSORY_WIDTH} jc="center" ai="center">
                {itemRight}
              </View>
            </XStack>
          )}
        </YStack>
      </YStack>
    </YStack>
  );
}

type HeaderButtonProps = Omit<ButtonProps, 'icon'> & {
  icon: ComponentType<IconProps>;
};

export const HeaderButton = forwardRef<TamaguiElement, HeaderButtonProps>(
  (props, ref) => {
    const { icon: Icon, ...otherProps } = props;
    const size = ACCESSORY_WIDTH - 12;
    return (
      <Button
        ref={ref}
        chromeless
        p={0}
        w={size}
        h={size}
        borderRadius={size / 2}
        icon={<Icon size={22} />}
        {...otherProps}
      />
    );
  },
);
