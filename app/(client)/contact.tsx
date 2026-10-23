import * as Crypto from 'expo-crypto';
import { useRouter } from 'expo-router';
import type React from 'react';
import { useEffect } from 'react';

import { ContactScreen } from '@/features/client/screens/contact-screen';
import type { ClientProfile } from '@/features/client/types';
import { routes } from '@/lib/navigation/routes';
import { useClientStore } from '@/store/client-store';
import { useRequestDraftStore } from '@/store/request-draft-store';

export default function ContactRoute(): React.JSX.Element {
  const router = useRouter();
  const journeyType = useRequestDraftStore((state) => state.journeyType);
  const contact = useRequestDraftStore((state) => state.contact);
  const clientId = useRequestDraftStore((state) => state.clientId);
  const saveContact = useRequestDraftStore((state) => state.saveContact);
  const clients = useClientStore((state) => state.clients);

  useEffect(() => {
    if (journeyType === null) {
      router.replace(routes.requestType);
    }
  }, [journeyType, router]);

  if (journeyType === null) {
    return <></>;
  }

  const handleContinue = (nextContact: Parameters<typeof saveContact>[0]) => {
    const reuseDraftClientId =
      contact?.phone === nextContact.phone && clientId !== null ? clientId : null;
    saveContact(nextContact, reuseDraftClientId ?? `cli_${Crypto.randomUUID()}`);
    router.push(routes.pin);
  };

  const handleContinueExisting = (client: ClientProfile) => {
    const existingContact = {
      firstName: client.firstName,
      lastName: client.lastName,
      phone: client.phone,
      ...(client.email === undefined ? {} : { email: client.email }),
      ...(client.address === undefined ? {} : { address: client.address }),
    };
    saveContact(existingContact, client.id);
    router.push(routes.pin);
  };

  return (
    <ContactScreen
      isAdultJourney={journeyType === 'self'}
      contact={contact}
      clientId={clientId}
      clients={clients}
      onBack={() => router.back()}
      onContinue={handleContinue}
      onContinueExisting={handleContinueExisting}
    />
  );
}
