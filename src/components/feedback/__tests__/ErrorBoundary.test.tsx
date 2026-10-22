import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ErrorBoundary } from '@/components/feedback';

function Boom(): never {
  throw new Error('boom');
}

describe('ErrorBoundary', () => {
  beforeEach(() => {
    jest.spyOn(console, 'error').mockImplementation(() => undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders its children when nothing throws', async () => {
    const { getByText } = await render(
      <ErrorBoundary title="Something went wrong" retryLabel="Retry">
        <Text>Child content</Text>
      </ErrorBoundary>,
    );

    expect(getByText('Child content')).toBeTruthy();
  });

  it('renders the fallback when a child throws', async () => {
    const { getByText } = await render(
      <ErrorBoundary title="Something went wrong" retryLabel="Retry">
        <Boom />
      </ErrorBoundary>,
    );

    expect(getByText('Something went wrong')).toBeTruthy();
    expect(getByText('Retry')).toBeTruthy();
  });

  it('reports the error to the caller', async () => {
    const onError = jest.fn();

    await render(
      <ErrorBoundary title="Something went wrong" onError={onError}>
        <Boom />
      </ErrorBoundary>,
    );

    expect(onError).toHaveBeenCalled();
  });

  it('supports a custom fallback', async () => {
    const { getByText } = await render(
      <ErrorBoundary
        title="Something went wrong"
        fallback={(error) => <Text>{error.message}</Text>}
      >
        <Boom />
      </ErrorBoundary>,
    );

    expect(getByText('boom')).toBeTruthy();
  });
});
