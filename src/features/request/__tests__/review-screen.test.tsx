import { fireEvent, render, screen } from '@testing-library/react-native';

import type { ChildDraftRecord } from '@/features/children';
import type { ClientContactDetails } from '@/features/client';
import type { AdultLearningNeedDraft, ChildLearningNeedDraft } from '@/features/request/types';
import { useSessionStore } from '@/store/session-store';

import { ReviewScreen } from '../screens/review-screen';

const contact: ClientContactDetails = {
  firstName: 'Amina',
  lastName: 'Kabila',
  phone: '+243812345678',
  email: 'amina@example.com',
  address: 'Gombe, Kinshasa',
};

const child: ChildDraftRecord = {
  id: 'chd_review',
  firstName: 'Junior',
  lastName: 'Kabila',
  yearOfBirth: 2016,
  level: 'P4',
  school: 'École du Centre',
  notes: 'Needs a quiet study space',
  createdAt: 1,
  updatedAt: 1,
};

const childNeed: ChildLearningNeedDraft = {
  id: 'ned_review',
  childId: child.id,
  learnerIsClient: false,
  subject: 'Mathematics',
  level: 'P4',
  objective: 'Build confidence with fractions',
  frequency: 'weekly_2',
  sessionMinutes: 45,
  availability: 'Tuesday evenings',
  format: 'home',
  location: 'Gombe, Kinshasa',
  notes: 'Bring practice worksheets',
  createdAt: 1,
  updatedAt: 1,
};

const adultNeed: AdultLearningNeedDraft = {
  id: 'ned_adult_review',
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

function createProps(
  journeyType: 'child' | 'self',
  onSubmit: () => void = jest.fn(),
) {
  return {
    journeyType,
    childDrafts: journeyType === 'child' ? [child] : [],
    needsByChildId: journeyType === 'child' ? { [child.id]: [childNeed] } : {},
    selfNeeds: journeyType === 'self' ? [adultNeed] : [],
    contact,
    tutorPreference: journeyType === 'child' ? 'same' as const : 'none' as const,
    errorMessage: null,
    isSubmitting: false,
    onEditChildren: jest.fn(),
    onEditNeedsForChild: jest.fn(),
    onEditSelfNeeds: jest.fn(),
    onEditLearner: jest.fn(),
    onEditContact: jest.fn(),
    onEditTutorPreference: jest.fn(),
    onSubmit,
  };
}

describe('ReviewScreen', () => {
  beforeEach(() => {
    useSessionStore.getState().setLocaleOverride('en');
  });

  it('shows the full child request, including year of birth and derived age', async () => {
    await render(<ReviewScreen {...createProps('child')} />);

    expect(screen.getByText('Junior Kabila')).toBeTruthy();
    expect(screen.getByText('Year of birth')).toBeTruthy();
    expect(screen.getByText('2016')).toBeTruthy();
    expect(screen.getByText('Estimated age: 10')).toBeTruthy();
    expect(screen.getByText('École du Centre')).toBeTruthy();
    expect(screen.getByText('Needs a quiet study space')).toBeTruthy();
    expect(screen.getByText('Build confidence with fractions')).toBeTruthy();
    expect(screen.getByText('45 minutes')).toBeTruthy();
    expect(screen.getByText('Tuesday evenings')).toBeTruthy();
    expect(screen.getByText('Bring practice worksheets')).toBeTruthy();
    expect(screen.getByText('amina@example.com')).toBeTruthy();
    expect(screen.getAllByText('Gombe, Kinshasa').length).toBeGreaterThan(0);
    expect(screen.getByText('Same tutor if possible')).toBeTruthy();
  });

  it('shows the adult learner and their needs without child details', async () => {
    await render(<ReviewScreen {...createProps('self')} />);

    expect(screen.getAllByText('Amina').length).toBeGreaterThan(0);
    expect(screen.getByText('Practice everyday conversation')).toBeTruthy();
    expect(screen.getByText('Saturday mornings')).toBeTruthy();
    expect(screen.queryByText('Children')).toBeNull();
    expect(screen.queryByText('Junior')).toBeNull();
  });

  it('shows the submission error and lets the client retry', async () => {
    const onSubmit = jest.fn();
    await render(
      <ReviewScreen
        {...createProps('self', onSubmit)}
        errorMessage="review.error.noNeeds"
      />,
    );

    expect(screen.getByTestId('review-submit-error')).toBeTruthy();
    expect(screen.getByText('Add at least one need before submitting.')).toBeTruthy();
    await fireEvent.press(screen.getByText('Try again'));
    expect(onSubmit).toHaveBeenCalledTimes(1);
  });
});
