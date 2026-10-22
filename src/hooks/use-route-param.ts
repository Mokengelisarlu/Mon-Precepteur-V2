import { useLocalSearchParams } from 'expo-router';

import { type EntityKind, isEntityId, readParam } from '@/lib/navigation/params';

export function useRouteParam(name: string, kind: EntityKind): string | null {
  const params = useLocalSearchParams<Record<string, string | string[]>>();
  const value = readParam(params[name]);

  return isEntityId(value, kind) ? value : null;
}
