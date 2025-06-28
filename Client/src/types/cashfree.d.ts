declare module '@cashfreepayments/cashfree-js' {
  export function load(config: { mode: 'sandbox' | 'production' }): Promise<{
    checkout: (options: {
      paymentSessionId: string;
      redirectTarget: string;
    }) => Promise<void>;
  }>;
} 