import { useRouter } from 'expo-router';
import type React from 'react';

import { LoginUnavailableScreen } from '@/features/client/screens/login-unavailable-screen';
import { routes } from '@/lib/navigation/routes';

export default function LoginRoute(): React.JSX.Element {
  const router = useRouter();

  return <LoginUnavailableScreen onBackHome={() => router.replace(routes.welcome)} />;
}
