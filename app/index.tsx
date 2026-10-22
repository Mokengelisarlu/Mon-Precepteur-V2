import { Redirect } from 'expo-router';
import type React from 'react';

import { routes } from '@/lib/navigation/routes';

export default function IndexRoute(): React.JSX.Element {
  return <Redirect href={routes.welcome} />;
}
