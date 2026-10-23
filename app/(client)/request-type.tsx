import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';
import { Platform } from 'react-native';

import { RequestTypeScreen } from '@/features/request/screens/request-type-screen';
import type { JourneyType } from '@/features/request/types';
import { routes } from '@/lib/navigation/routes';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function RequestTypeRoute(): React.JSX.Element {
  const router = useRouter();
  const setJourneyType = useRequestDraftStore((state) => state.setJourneyType);

  useEffect(() => {
    if (Platform.OS !== 'web' || typeof window === 'undefined') {
      return;
    }

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        router.back();
      }
    };

    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [router]);

  const handleSelect = (journeyType: JourneyType) => {
    setJourneyType(journeyType);
    router.replace(journeyType === 'child' ? routes.children : routes.needsSelf);
  };

  return (
    <RequestTypeScreen
      onClose={() => router.back()}
      onSelect={handleSelect}
    />
  );
}
