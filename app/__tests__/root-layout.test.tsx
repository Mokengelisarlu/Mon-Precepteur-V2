import { renderRouter, screen } from 'expo-router/testing-library';

describe('Root layout', () => {
  it('should render the application surface', async () => {
    await renderRouter();

    expect(screen.getByText('Mon Précepteur')).toBeTruthy();
  });
});
