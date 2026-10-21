import { beforeEach, describe, expect, it, vi } from 'vitest';

const policy = vi.hoisted(() => ({ adult: false }));
const push = vi.hoisted(() => ({
  requestPermissions: vi.fn(() => Promise.resolve({ receive: 'denied' })),
  register: vi.fn(),
  addListener: vi.fn(),
}));
vi.mock('@services/ageScreen/ageScreenPolicy', () => ({ isAdultSession: () => policy.adult }));
vi.mock('@/types/common', () => ({ getPlatform: () => 'android' }));
vi.mock('@capacitor/push-notifications', () => ({ PushNotifications: push }));
vi.mock('@services/firebase/firestore', () => ({ docs: {}, updateDocument: vi.fn() }));

import { initializeNotifications, setupNotificationListeners } from './notificationService';

describe('bildirim yaş kuralı', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    policy.adult = false;
  });
  it('çocuk/bilinmeyen yaşta izin, token veya dinleyici oluşturmaz', async () => {
    expect(await initializeNotifications('child-session')).toBeNull();
    setupNotificationListeners(vi.fn());
    expect(push.requestPermissions).not.toHaveBeenCalled();
    expect(push.register).not.toHaveBeenCalled();
    expect(push.addListener).not.toHaveBeenCalled();
  });
  it('yetişkin oturumunda cihaz izni reddedilirse kayıt yapmaz', async () => {
    policy.adult = true;
    expect(await initializeNotifications('parent-session')).toBeNull();
    expect(push.requestPermissions).toHaveBeenCalledOnce();
    expect(push.register).not.toHaveBeenCalled();
  });
});
