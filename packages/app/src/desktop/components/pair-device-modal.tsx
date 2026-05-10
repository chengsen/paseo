import { AdaptiveModalSheet } from "@/components/adaptive-modal-sheet";
import { PairDeviceSection } from "@/desktop/components/pair-device-section";
import { useTranslation } from "@/i18n";

export interface PairDeviceModalProps {
  visible: boolean;
  onClose: () => void;
  testID?: string;
}

const SNAP_POINTS: string[] = ["82%", "94%"];

export function PairDeviceModal({ visible, onClose, testID }: PairDeviceModalProps) {
  const { t } = useTranslation();
  return (
    <AdaptiveModalSheet
      title={t.host.pairADevice}
      visible={visible}
      onClose={onClose}
      snapPoints={SNAP_POINTS}
      desktopMaxWidth={640}
      testID={testID}
    >
      <PairDeviceSection />
    </AdaptiveModalSheet>
  );
}
