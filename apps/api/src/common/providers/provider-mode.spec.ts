import { assertProductionProvider } from './provider-mode';

describe('assertProductionProvider', () => {
  it('allows configured real providers in production', () => {
    expect(() =>
      assertProductionProvider({
        nodeEnv: 'production',
        provider: 'fcm',
        allowed: ['fcm'],
        configKey: 'PUSH_PROVIDER',
      }),
    ).not.toThrow();
  });

  it('rejects mock providers in production', () => {
    expect(() =>
      assertProductionProvider({
        nodeEnv: 'production',
        provider: 'mock',
        allowed: ['fcm'],
        configKey: 'PUSH_PROVIDER',
      }),
    ).toThrow('PUSH_PROVIDER=mock is not allowed in production');
  });

  it('allows mock providers outside production', () => {
    expect(() =>
      assertProductionProvider({
        nodeEnv: 'development',
        provider: 'mock',
        allowed: ['fcm'],
        configKey: 'PUSH_PROVIDER',
      }),
    ).not.toThrow();
  });
});
