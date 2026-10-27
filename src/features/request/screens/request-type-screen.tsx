import type React from 'react';

import { Sheet } from '@/components/ui';
import { useTranslation } from '@/hooks/use-translation';

import { RequestTypeOptions } from '../components/request-type-options';
import type { JourneyType } from '../types';

export interface RequestTypeScreenProps {
  readonly onClose: () => void;
  readonly onSelect: (journeyType: JourneyType) => void;
}

export function RequestTypeScreen({
  onClose,
  onSelect,
}: RequestTypeScreenProps): React.JSX.Element {
  const { t } = useTranslation();

  return (
    <Sheet
      visible
      onClose={onClose}
      title={t('requestType.title')}
      accessibilityLabel={t('requestType.title')}
      snapPoints={['40%']}
      testID="request-type-sheet"
    >
      <RequestTypeOptions onSelect={onSelect} />
    </Sheet>
  );
}
