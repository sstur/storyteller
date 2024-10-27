import { Modal } from 'react-native';

import { Spinner, YStack } from '~/components/core';

type Props = {
  visible: boolean;
};

export function FullScreenLoadingModal({ visible }: Props) {
  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <YStack flex={1} jc="center" ai="center" bg="rgba(0, 0, 0, 0.88)">
        <Spinner size="large" />
      </YStack>
    </Modal>
  );
}
