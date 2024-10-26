import type { ReactElement } from 'react';
import ReanimatedSwipeable from 'react-native-gesture-handler/ReanimatedSwipeable';
import type { SharedValue } from 'react-native-reanimated';
import Reanimated, { useAnimatedStyle } from 'react-native-reanimated';

import { Text, YStack } from '~/components/core';

const BUTTON_WIDTH = 76;

type Action = {
  title: string;
  onPress: () => void;
  color?: string;
  backgroundColor?: string;
};

function RightActionsView(props: {
  action: Action;
  prog: SharedValue<number>;
  drag: SharedValue<number>;
}) {
  const { action, drag } = props;
  const styleAnimation = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: drag.value + BUTTON_WIDTH }],
    };
  });

  return (
    <Reanimated.View style={styleAnimation}>
      {/* TODO: Make this pressable */}
      <YStack
        flex={1}
        backgroundColor={action.backgroundColor}
        width={BUTTON_WIDTH}
        jc="center"
        ai="center"
      >
        <Text color={action.color}>{action.title}</Text>
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
