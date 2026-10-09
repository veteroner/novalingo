import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest';
import { IAP_PRODUCTS } from '@/config/constants';

const mocks = vi.hoisted(() => ({
  platform: vi.fn(() => 'ios'),
  auth: { currentUser: { uid: 'buyer', getIdToken: vi.fn(async () => 'token') } },
  getDoc: vi.fn(),
  updateDoc: vi.fn(),
  callable: vi.fn(),
}));
vi.mock('@capacitor/core', () => ({ Capacitor: { getPlatform: mocks.platform } }));
vi.mock('@services/firebase/app', () => ({ auth: mocks.auth, db: {}, functions: {} }));
vi.mock('firebase/firestore', () => ({
  doc: vi.fn(),
  getDoc: mocks.getDoc,
  updateDoc: mocks.updateDoc,
}));
vi.mock('firebase/functions', () => ({ httpsCallable: () => mocks.callable }));

describe('native subscription flow', () => {
  let service: typeof import('./subscriptionService');
  let approved: (tx: {
    transactionId: string;
    products: { id: string }[];
    finish: ReturnType<typeof vi.fn>;
  }) => void;
  let finished: (tx: unknown) => void;
  let offer: {
    pricingPhases: {
      price: string;
      priceMicros: number;
      billingPeriod: string;
      paymentMode?: string;
    }[];
  };
  let store: {
    register: ReturnType<typeof vi.fn>;
    initialize: ReturnType<typeof vi.fn>;
    get: ReturnType<typeof vi.fn>;
    order: ReturnType<typeof vi.fn>;
    restorePurchases: ReturnType<typeof vi.fn>;
    when: ReturnType<typeof vi.fn>;
  };
  const productUpdated = vi.fn();

  beforeEach(async () => {
    vi.resetModules();
    vi.clearAllMocks();
    mocks.platform.mockReturnValue('ios');
    offer = { pricingPhases: [{ price: '₺149,99', priceMicros: 149990000, billingPeriod: 'P1M' }] };
    store = {
      register: vi.fn(),
      initialize: vi.fn(),
      get: vi.fn(() => ({ getOffer: () => offer })),
      order: vi.fn(async () => undefined),
      restorePurchases: vi.fn(async () => undefined),
      when: vi.fn(() => ({
        approved: (cb: typeof approved) => {
          approved = cb;
        },
        finished: (cb: typeof finished) => {
          finished = cb;
        },
        productUpdated,
      })),
    };
    vi.stubGlobal('CdvPurchase', {
      store,
      Platform: { APPLE_APPSTORE: 'apple', GOOGLE_PLAY: 'google' },
      ProductType: { PAID_SUBSCRIPTION: 'subscription' },
      LogLevel: { WARNING: 1, DEBUG: 2 },
      ErrorCode: { PAYMENT_CANCELLED: 7 },
    });
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{}', { status: 200 })),
    );
    service = await import('./subscriptionService');
  });
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('initializes the native store only once', () => {
    service.initializeStore();
    service.initializeStore();
    expect(store.initialize).toHaveBeenCalledOnce();
    expect(store.initialize).toHaveBeenCalledWith(['apple']);
    expect(store.register).toHaveBeenCalledWith(
      expect.arrayContaining([
        expect.objectContaining({ id: IAP_PRODUCTS.YEARLY, platform: 'apple' }),
      ]),
    );
  });
  it('does not initialize a web store', () => {
    mocks.platform.mockReturnValue('web');
    service.initializeStore();
    expect(store.initialize).not.toHaveBeenCalled();
  });
  it('sends the transaction and Firebase token before finishing an iOS purchase', async () => {
    service.initializeStore();
    const finish = vi.fn();
    approved({ transactionId: '123', products: [], finish });
    await vi.waitFor(() => {
      expect(finish).toHaveBeenCalledOnce();
    });
    expect(fetch).toHaveBeenCalledWith(
      'https://novalingo.teknovagroup.com/.netlify/functions/verifyApplePurchase',
      expect.objectContaining({
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer token' },
        body: JSON.stringify({ transactionId: '123' }),
      }),
    );
  });
  it.each([500, 502, 503])(
    'keeps a purchase pending after HTTP %i so StoreKit can retry',
    async (status) => {
      vi.mocked(fetch).mockResolvedValue(new Response('{}', { status }));
      service.initializeStore();
      const finish = vi.fn();
      approved({ transactionId: '123', products: [], finish });
      await vi.waitFor(() => {
        expect(fetch).toHaveBeenCalledOnce();
      });
      await new Promise((resolve) => setTimeout(resolve, 0));
      expect(finish).not.toHaveBeenCalled();
    },
  );
  it('keeps a purchase pending after a network failure', async () => {
    vi.mocked(fetch).mockRejectedValue(new Error('offline'));
    service.initializeStore();
    const finish = vi.fn();
    approved({ transactionId: '123', products: [], finish });
    await vi.waitFor(() => {
      expect(fetch).toHaveBeenCalledOnce();
    });
    await new Promise((resolve) => setTimeout(resolve, 0));
    expect(finish).not.toHaveBeenCalled();
  });
  it('finishes a permanently rejected transaction', async () => {
    vi.mocked(fetch).mockResolvedValue(new Response('{}', { status: 409 }));
    service.initializeStore();
    const finish = vi.fn();
    approved({ transactionId: '123', products: [], finish });
    await vi.waitFor(() => {
      expect(finish).toHaveBeenCalledOnce();
    });
  });
  it('retains Android token registration', () => {
    mocks.platform.mockReturnValue('android');
    service.initializeStore();
    finished({
      products: [{ id: IAP_PRODUCTS.YEARLY }],
      parentReceipt: { purchaseToken: 'purchase-token' },
    });
    expect(mocks.callable).toHaveBeenCalledWith({
      purchaseToken: 'purchase-token',
      productId: IAP_PRODUCTS.YEARLY,
    });
  });
  it('links a purchase to the signed-in user', async () => {
    expect(await service.purchaseSubscription(IAP_PRODUCTS.YEARLY)).toEqual({
      status: 'store_redirect',
    });
    expect(store.order).toHaveBeenCalledWith(offer, { applicationUsername: 'buyer' });
  });
  it('returns cancellation without reporting a purchase error', async () => {
    store.order.mockResolvedValue({ code: 7, message: 'cancelled' });
    expect(await service.purchaseSubscription(IAP_PRODUCTS.YEARLY)).toEqual({
      status: 'cancelled',
    });
  });
  it('reports store errors', async () => {
    store.order.mockResolvedValue({ code: 8, message: 'unavailable' });
    expect(await service.purchaseSubscription(IAP_PRODUCTS.YEARLY)).toEqual({
      status: 'error',
      message: 'unavailable',
    });
  });
  it('reports a product that has not loaded', async () => {
    store.get.mockReturnValue(undefined);
    expect(await service.purchaseSubscription(IAP_PRODUCTS.YEARLY)).toMatchObject({
      status: 'error',
    });
  });
  it('restores access from the verified Firestore projection', async () => {
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ isPremium: true }) });
    expect(await service.restorePurchases()).toEqual({ status: 'success' });
  });
  it('uses the existing projection when native restore fails', async () => {
    store.restorePurchases.mockResolvedValue({ code: 8 });
    mocks.getDoc.mockResolvedValue({ exists: () => true, data: () => ({ isPremium: true }) });
    expect(await service.restorePurchases()).toEqual({ status: 'success' });
  });
  it('rejects restore on web', async () => {
    mocks.platform.mockReturnValue('web');
    expect(await service.restorePurchases()).toMatchObject({ status: 'error' });
  });
  it('uses localized store pricing', () => {
    expect(service.getProductPricing(IAP_PRODUCTS.YEARLY)).toMatchObject({
      price: '₺149,99',
      priceMicros: 149990000,
      trialDays: null,
    });
  });
  it.each([
    ['P7D', 7],
    ['P1W', 7],
    ['P1M', 30],
    ['P1Y', 365],
  ])('reads the %s free trial', (period, days) => {
    offer.pricingPhases.unshift({
      price: 'Free',
      priceMicros: 0,
      billingPeriod: period,
      paymentMode: 'FreeTrial',
    });
    expect(service.getProductPricing(IAP_PRODUCTS.YEARLY)?.trialDays).toBe(days);
  });
  it('subscribes to price updates', () => {
    const cb = vi.fn();
    service.onProductsUpdated(cb);
    expect(productUpdated).toHaveBeenCalledWith(cb);
  });
  it('grants development premium through Firestore', async () => {
    await service.devGrantPremium();
    expect(mocks.updateDoc).toHaveBeenCalledWith(undefined, { isPremium: true });
  });
});
