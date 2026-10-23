import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { PinScreen } from '@/features/client/screens/pin-screen';
import type { ClientProfile } from '@/features/client/types';
import { createPinCredentials, hashPin } from '@/lib/crypto/pin';
import { routes } from '@/lib/navigation/routes';
import { useClientStore } from '@/store/client-store';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function PinRoute(): React.JSX.Element {
  const router = useRouter();
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const contact = useRequestDraftStore((state) => state.contact);
  const clientId = useRequestDraftStore((state) => state.clientId);
  const clients = useClientStore((state) => state.clients);
  const saveClient = useClientStore((state) => state.saveClient);
  const existingClient = clients.find((client) => client.id === clientId);

  useEffect(() => {
    if (journeyType === null) {
      router.replace(routes.requestType);
    } else if (contact === null || clientId === null) {
      router.replace(routes.contact);
    }
  }, [clientId, contact, journeyType, router]);

  if (journeyType === null || contact === null || clientId === null) {
    return <></>;
  }

  const handleCreatePin = async (pin: string): Promise<void> => {
    const credentials = await createPinCredentials(pin);
    const now = Date.now();
    const client: ClientProfile = {
      id: clientId,
      ...contact,
      ...credentials,
      createdAt: now,
      updatedAt: now,
    };

    saveClient(client);
    router.push(routes.review);
  };

  const handleVerifyPin = async (pin: string): Promise<boolean> => {
    if (existingClient === undefined) {
      throw new Error('An existing profile is required to verify its PIN.');
    }

    const isValid = (await hashPin(pin, existingClient.pinSalt)) === existingClient.pinHash;
    if (isValid) {
      router.push(routes.review);
    }
    return isValid;
  };

  return (
    <PinScreen
      isAdultJourney={journeyType === 'self'}
      isExistingClient={existingClient !== undefined}
      onBack={() => router.back()}
      onCreatePin={handleCreatePin}
      onVerifyPin={handleVerifyPin}
    />
  );
}
