import type { ReactElement } from 'react';
import type { StyleProp, ViewStyle } from 'react-native';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

import type { TextProps, ViewProps } from '~/components/core';
import { Spinner, Text, YStack } from '~/components/core';

const BUTTON_WIDTH = 76;

type Action = {
  title: string;
  isLoading?: boolean;
  onPress: () => void;
  outerViewStyle?: StyleProp<ViewStyle>;
  viewProps?: ViewProps;
  textProps?: TextProps;
};

function RightActionsView(props: {
  action: Action;
  prog: SharedValue<number>;
  drag: SharedValue<number>;
}) {
  const { action, drag } = props;
  const { title, isLoading, onPress, outerViewStyle, viewProps, textProps } =
    action;
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + BUTTON_WIDTH }],
    };
  });

  return (
    <Reanimated.View style={[outerViewStyle, styleAnimation]}>
      <YStack
        flex={1}
        width={BUTTON_WIDTH}
        jc="center"
        ai="center"
        onPress={() => {
          if (!isLoading) {
            onPress();
          }
        }}
        {...viewProps}
      >
        {isLoading ? <Spinner /> : <Text {...textProps}>{title}</Text>}
      </YStack>
    </Reanimated.View>
  );
}

export function SwipeableRow(props: {
  actionRight: Action;
  children: ReactElement;
}) {
  const { actionRight, children } = props;
  return (
    <ReanimatedSwipeable
      friction={2}
      rightThreshold={40}
      renderRightActions={(prog, drag) => (
        <RightActionsView action={actionRight} prog={prog} drag={drag} />
      )}
    >
      {children}
    </ReanimatedSwipeable>
  );
}
