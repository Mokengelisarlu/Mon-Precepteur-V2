import { renderRouter, screen } from 'expo-router/testing-library';

describe('Root layout', () => {
  it('should render the application surface on the welcome screen', async () => {
    const result = renderRouter();

    await result;

    expect(result.getPathnameWithParams()).toBe('/welcome');
    expect(screen.getByTestId('welcome-get-started')).toBeTruthy();
  });
});
