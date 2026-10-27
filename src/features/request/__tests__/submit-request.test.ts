import type { ChildDraftRecord, ChildOnboardingData } from '@/features/children';
import type { ClientProfile } from '@/features/client';
import type {
  AdultLearningNeedDraft,
  RequestRecord,
} from '@/features/request/types';

import { generateRequestReference } from '../lib/reference';
import { submitRequest, type RequestDraftData, type SubmitRequestInput } from '../services/submit-request';

const client: ClientProfile = {
  id: 'cli_test',
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  pinHash: 'hashed-pin',
  pinSalt: 'random-salt',
  createdAt: 1,
  updatedAt: 1,
};

const contact = {
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  city: 'Lubumbashi',
  commune: 'Kampemba',
  quartier: 'Bel-Air',
  avenue: 'Avenue Lumumba',
  number: '12B',
  address: '12B, Avenue Lumumba, Bel-Air, Kampemba, Lubumbashi',
};

const child: ChildDraftRecord = {
  id: 'chd_test',
  firstName: 'Junior',
  yearOfBirth: 2016,
  level: 'P4',
  createdAt: 1,
  updatedAt: 1,
};

const learningContext: ChildOnboardingData = {
  firstName: 'Junior',
  lastName: '',
  birthYear: '2016',
  gender: 'boy',
  grade: 'p4',
  school: '',
  estimatedLevel: 'satisfactory',
  subjects: ['mathematics'],
  otherSubject: '',
  goals: ['homework'],
  notes: '',
  startDate: '2026-05-08',
  frequency: 'weekly_3',
  days: ['mon', 'tue', 'wed'],
  slots: ['evening'],
};

const adultNeed: AdultLearningNeedDraft = {
  id: 'ned_adult',
  learnerIsClient: true,
  subject: 'English',
  level: 'Beginner',
  objective: 'Practice everyday conversation',
  frequency: 'weekly_1',
  sessionMinutes: 60,
  availability: 'Saturday mornings',
  format: 'online',
  createdAt: 1,
  updatedAt: 1,
};

function createInput(draft: RequestDraftData): SubmitRequestInput {
  return {
    draft,
    client,
    existingRequests: [],
    ids: {
      requestId: 'req_test',
      eventId: 'evt_test',
      notificationId: 'ntf_test',
    },
    now: new Date('2026-05-01T12:00:00Z').getTime(),
  };
}

function childDraft(overrides: Partial<RequestDraftData> = {}): RequestDraftData {
  return {
    journeyType: 'child',
    contact,
    clientId: client.id,
    children: [child],
    onboardingByChildId: { [child.id]: learningContext },
    selfNeeds: [],
    tutorPreference: 'none',
    ...overrides,
  };
}

function selfDraft(overrides: Partial<RequestDraftData> = {}): RequestDraftData {
  return {
    journeyType: 'self',
    contact,
    clientId: client.id,
    children: [],
    onboardingByChildId: {},
    selfNeeds: [adultNeed],
    tutorPreference: 'none',
    ...overrides,
  };
}

describe('generateRequestReference', () => {
  it('starts at 0001 and increments the highest sequence for the selected year', () => {
    expect(generateRequestReference(2026, [])).toBe('MP-2026-0001');
    expect(
      generateRequestReference(2026, [
        'MP-2025-0040',
        'MP-2026-0003',
        'MP-2026-0008',
        'MP-2026-invalid',
      ]),
    ).toBe('MP-2026-0009');
  });

  it('allows sequence numbers to grow beyond four digits', () => {
    expect(generateRequestReference(2026, ['MP-2026-9999'])).toBe('MP-2026-10000');
  });
});

describe('submitRequest', () => {
  it('submits a parent request and returns all records with a received status', () => {
    const existingRequest: RequestRecord = {
      id: 'req_previous',
      reference: 'MP-2026-0007',
      clientId: client.id,
      needIds: ['ned_previous'],
      tutorPreference: 'none',
      status: 'received',
      createdAt: 1,
      updatedAt: 1,
      submittedAt: 1,
      type: 'self',
      childIds: [],
    };
    const input = createInput(childDraft());
    const result = submitRequest({ ...input, existingRequests: [existingRequest] });

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.request).toMatchObject({
      id: 'req_test',
      reference: 'MP-2026-0008',
      clientId: client.id,
      type: 'child',
      childIds: [child.id],
      needIds: [],
      learningContext,
      tutorPreference: 'none',
      status: 'received',
      submittedAt: input.now,
    });
    expect(result.value.children).toEqual([{ ...child, clientId: client.id }]);
    expect(result.value.needs).toEqual([]);
    expect(result.value.activityEvent).toMatchObject({
      id: 'evt_test',
      requestId: 'req_test',
      actor: 'client',
      toStatus: 'received',
    });
    expect(result.value.notification).toMatchObject({
      id: 'ntf_test',
      clientId: client.id,
      requestId: 'req_test',
      type: 'request_received',
      params: { reference: 'MP-2026-0008' },
    });
  });

  it('submits an adult request without children', () => {
    const result = submitRequest(createInput(selfDraft()));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.request).toMatchObject({
      type: 'self',
      childIds: [],
      needIds: [adultNeed.id],
      status: 'received',
    });
    expect(result.value.children).toEqual([]);
    expect(result.value.needs).toEqual([{ ...adultNeed, requestId: 'req_test' }]);
  });

  it('accepts a child request without creating any learning-need records', () => {
    const result = submitRequest(createInput(childDraft()));

    expect(result.ok).toBe(true);
    if (!result.ok) {
      return;
    }

    expect(result.value.request.needIds).toEqual([]);
    expect(result.value.needs).toEqual([]);
  });

  it.each([
    ['missing onboarding context', childDraft({ onboardingByChildId: {} }), client, 'review.error.invalid'],
    [
      'invalid contact',
      childDraft({ contact: { ...contact, phone: 'not-a-phone' } }),
      client,
      'review.error.contact',
    ],
    ['missing PIN credentials', childDraft(), { ...client, pinHash: '', pinSalt: '' }, 'review.error.pin'],
  ] as const)('rejects a request with %s and returns no records', (_case, draft, profile, message) => {
    const result = submitRequest({
      ...createInput(draft),
      client: profile,
    });

    expect(result).toEqual({
      ok: false,
      error: { code: 'VALIDATION_FAILED', message },
    });
  });

  it('rejects mixed child and adult data and duplicate adult need identifiers', () => {
    const mixedJourney = submitRequest(
      createInput(childDraft({ selfNeeds: [adultNeed] })),
    );
    const duplicateNeedIds = submitRequest(
      createInput(selfDraft({ selfNeeds: [adultNeed, adultNeed] })),
    );

    expect(mixedJourney).toMatchObject({
      ok: false,
      error: { message: 'review.error.invalid' },
    });
    expect(duplicateNeedIds).toMatchObject({
      ok: false,
      error: { message: 'review.error.invalid' },
    });
  });

  it('rejects a parent request containing more than one child', () => {
    const secondChild: ChildDraftRecord = {
      ...child,
      id: 'chd_second',
      firstName: 'Ariane',
    };
    const result = submitRequest(
      createInput(
        childDraft({
          children: [child, secondChild],
          onboardingByChildId: {
            [child.id]: learningContext,
            [secondChild.id]: learningContext,
          },
        }),
      ),
    );

    expect(result).toMatchObject({
      ok: false,
      error: { message: 'review.error.invalid' },
    });
  });
});
