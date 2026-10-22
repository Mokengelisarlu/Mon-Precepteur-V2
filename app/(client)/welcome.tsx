import { useRouter } from 'expo-router';
import type React from 'react';

import { WelcomeScreen } from '@/features/request/screens/welcome-screen';
import { routes } from '@/lib/navigation/routes';

export default function WelcomeRoute(): React.JSX.Element {
  const router = useRouter();

  return (
    <WelcomeScreen
      onGetStarted={() => router.push(routes.requestType)}
      onOpenAdmin={() => router.push(routes.adminRoot)}
    />
  );
}
