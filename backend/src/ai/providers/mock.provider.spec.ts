import { MockProvider } from './mock.provider';

describe('MockProvider', () => {
  const provider = new MockProvider();

  it('is offline and returns a non-empty answer', async () => {
    const out = await provider.chat([
      { role: 'system', content: 'stage: VALIDATION' },
      { role: 'user', content: 'How should I price my product?' },
    ]);
    expect(provider.offline).toBe(true);
    expect(out.length).toBeGreaterThan(20);
  });

  it('tailors advice to pricing questions', async () => {
    const out = await provider.chat([{ role: 'user', content: 'help with pricing please' }]);
    expect(out.toLowerCase()).toContain('price');
  });
});
