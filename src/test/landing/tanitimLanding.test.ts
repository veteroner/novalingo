/**
 * Ebeveyn tanıtım sayfası (public/tanitim/index.html) — reklam ölçümü sözleşmesi.
 *
 * - Kimlikler boşken hiçbir Google betiği yüklenmez, izin kutusu çıkmaz, hata atılmaz.
 * - Mağaza bağlantıları kampanya etiketlerini taşır; App Store etiketi yalnız `pt` varken eklenir.
 * - Google Ads betiği yalnız "Kabul et" sonrası yüklenir; reddedilince dönüşüm gönderilmez.
 * - Sayfadaki ücretsiz plan iddiaları uygulamadaki gerçek sınırlarla aynıdır.
 */
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { FREE_TIER } from '@/config/constants';

const html = readFileSync(resolve(process.cwd(), 'public/tanitim/index.html'), 'utf8');
const body = /<body>([\s\S]*)<\/body>/.exec(html)?.[1] ?? '';
const inlineScript = body.slice(
  body.lastIndexOf('<script>') + '<script>'.length,
  body.lastIndexOf('</script>'),
);
const markup = body.slice(0, body.lastIndexOf('<script>'));

const PLAY = 'https://play.google.com/store/apps/details?id=com.novalingo.app';
const APP_STORE = 'https://apps.apple.com/tr/app/id6815107546';

type Config = { adsId?: string; label?: string; pt?: string };

/** CONFIG alanını sayfa kaynağında verilen değerle değiştirir (alan bulunmazsa test kırılır). */
function setField(script: string, field: string, value: string) {
  const pattern = new RegExp(`${field}: '[^']*'`);
  if (!pattern.test(script)) throw new Error(`CONFIG.${field} bulunamadı`);
  return script.replace(pattern, `${field}: '${value}'`);
}

/**
 * Sayfayı çalıştırır. `config` verilmezse yayımlanan CONFIG aynen kullanılır; verilirse kimlik
 * alanları yalnız verilen değerlerle (eksikler boş) kurulur.
 */
function boot(search = '', config?: Config) {
  let script = inlineScript;
  if (config) {
    script = setField(script, 'adsId', config.adsId ?? '');
    script = setField(script, 'adsLabelPlay', config.label ?? '');
    script = setField(script, 'adsLabelAppStore', config.label ?? '');
    script = setField(script, 'appleProviderToken', config.pt ?? '');
  }

  window.history.replaceState(null, '', `/tanitim/${search}`);
  document.body.innerHTML = markup;
  const appended: HTMLScriptElement[] = [];
  vi.spyOn(document.head, 'appendChild').mockImplementation(<T extends Node>(node: T): T => {
    appended.push(node as unknown as HTMLScriptElement);
    return node;
  });
  // Sayfa betiği tarayıcıda olduğu gibi çalıştırılır.
  // eslint-disable-next-line @typescript-eslint/no-implied-eval
  new Function(script)();
  const links = [...document.querySelectorAll<HTMLAnchorElement>('a.store-link')];
  const consent = document.getElementById('consent') as HTMLElement;
  const dataLayer = () => (window as unknown as { dataLayer?: IArguments[] }).dataLayer ?? [];
  const conversions = () =>
    dataLayer().filter((entry) => entry[0] === 'event' && entry[1] === 'conversion');
  return { links, consent, appended, dataLayer, conversions };
}

/** Play bağlantısındaki kodlanmış `referrer` parametresinin içeriği. */
function playReferrer(links: HTMLAnchorElement[]) {
  const play = href(links, 'play');
  // Yalnız id ve referrer: ham utm_* veya gclid mağaza URL'sine düz eklenmez.
  expect([...play.searchParams.keys()].sort()).toEqual(['id', 'referrer']);
  return new URLSearchParams(play.searchParams.get('referrer') ?? '');
}

function href(links: HTMLAnchorElement[], store: 'play' | 'appstore') {
  const link = links.find((a) => a.dataset.store === store);
  if (!link) throw new Error(`no ${store} link`);
  return new URL(link.href);
}

beforeEach(() => {
  localStorage.clear();
  delete (window as unknown as { dataLayer?: unknown }).dataLayer;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('tanıtım sayfası — kimlikler boşken', () => {
  it('Google betiği yüklemez, izin kutusu göstermez ve iki mağazaya da gider', () => {
    const page = boot('', {});
    expect(page.appended).toHaveLength(0);
    expect(page.consent.hidden).toBe(true);
    expect(page.dataLayer()).toHaveLength(0);
    expect((document.getElementById('consent-open') as HTMLElement).hidden).toBe(true);

    const play = href(page.links, 'play');
    expect(`${play.origin}${play.pathname}?id=${play.searchParams.get('id') ?? ''}`).toBe(PLAY);
    expect(play.searchParams.get('referrer')).toBe(
      'utm_source=tanitim&utm_medium=web&utm_campaign=organik',
    );
    expect(playReferrer(page.links).get('utm_campaign')).toBe('organik');

    // pt yokken App Store bağlantısı sade kalır (ct tek başına izlenmez).
    expect(href(page.links, 'appstore').toString()).toBe(APP_STORE);
  });

  it('her indirme bölümünde iki mağaza bağlantısı var', () => {
    const page = boot('', {});
    expect(page.links.filter((a) => a.dataset.store === 'play')).toHaveLength(2);
    expect(page.links.filter((a) => a.dataset.store === 'appstore')).toHaveLength(2);
  });

  it('mağaza tıklaması hata atmaz ve hiçbir şey göndermez', () => {
    const page = boot('?gclid=abc', {});
    expect(() => {
      page.links[0]?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    }).not.toThrow();
    expect(page.conversions()).toHaveLength(0);
  });
});

describe('tanıtım sayfası — kampanya etiketleri', () => {
  it('reklam parametrelerini temizleyip Play ve App Store bağlantılarına taşır', () => {
    const page = boot(
      '?utm_source=instagram&utm_medium=paid_social&utm_campaign=TR Reels Ebeveyn&utm_content=hook-a',
      { pt: '123456' },
    );
    const ref = playReferrer(page.links);
    expect(ref.get('utm_source')).toBe('instagram');
    expect(ref.get('utm_medium')).toBe('paid_social');
    expect(ref.get('utm_campaign')).toBe('tr-reels-ebeveyn');
    expect(ref.get('utm_content')).toBe('hook-a');
    // Ham bağlantıda referrer tek parametre olarak kodlanmış durur.
    expect(href(page.links, 'play').search).toContain(
      'referrer=utm_source%3Dinstagram%26utm_medium%3Dpaid_social',
    );

    const apple = href(page.links, 'appstore');
    expect(apple.searchParams.get('pt')).toBe('123456');
    expect(apple.searchParams.get('ct')).toBe('instagram_tr-reels-ebeveyn');
    expect(apple.searchParams.get('mt')).toBe('8');
  });

  it('yalnız gclid ile gelen Google tıklamasını google/cpc olarak etiketler', () => {
    const page = boot('?gclid=xyz-secret&fbclid=abc');
    const ref = playReferrer(page.links);
    expect(ref.get('utm_source')).toBe('google');
    expect(ref.get('utm_medium')).toBe('cpc');
    // Tıklama kimlikleri hiçbir mağaza bağlantısına taşınmaz.
    for (const link of page.links) {
      expect(link.href).not.toContain('xyz-secret');
      expect(link.href).not.toContain('gclid');
      expect(link.href).not.toContain('fbclid');
    }
  });
});

describe('tanıtım sayfası — Google Ads izni', () => {
  const ids = { adsId: 'AW-TEST', label: 'LABEL' };

  it('izin verilmeden betik yüklemez, kabulden sonra yükler ve tıklamayı dönüşüm sayar', () => {
    const page = boot('?gclid=1', ids);
    expect(page.consent.hidden).toBe(false);
    expect(page.appended).toHaveLength(0);

    href(page.links, 'play');
    page.links[0]?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(page.conversions()).toHaveLength(0);

    (document.getElementById('consent-accept') as HTMLButtonElement).click();
    expect(page.consent.hidden).toBe(true);
    expect(page.appended).toHaveLength(1);
    expect(page.appended[0]?.src).toContain('googletagmanager.com/gtag/js?id=AW-TEST');
    expect(localStorage.getItem('novalingo_ads_consent')).toBe('granted');

    page.links[0]?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    const [conversion] = page.conversions();
    expect(conversion?.[2]).toMatchObject({ send_to: 'AW-TEST/LABEL', transport_type: 'beacon' });
  });

  it('reddedilince betik yüklemez ve dönüşüm göndermez; tercih hatırlanır', () => {
    const page = boot('', ids);
    (document.getElementById('consent-decline') as HTMLButtonElement).click();
    page.links[0]?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(page.appended).toHaveLength(0);
    expect(page.conversions()).toHaveLength(0);
    expect(localStorage.getItem('novalingo_ads_consent')).toBe('denied');

    vi.restoreAllMocks();
    const again = boot('', ids);
    expect(again.consent.hidden).toBe(true);
    expect(again.appended).toHaveLength(0);
  });

  it('kişiselleştirilmiş reklam sinyallerini kapalı tutar', () => {
    const page = boot('', ids);
    (document.getElementById('consent-accept') as HTMLButtonElement).click();
    const config = page.dataLayer().find((entry) => entry[0] === 'config');
    expect(config?.[2]).toMatchObject({ allow_ad_personalization_signals: false });
    const consentDefault = page.dataLayer().find((entry) => entry[0] === 'consent');
    expect(consentDefault?.[2]).toMatchObject({ ad_personalization: 'denied' });
  });
});

describe('tanıtım sayfası — yayımlanan yapılandırma', () => {
  it('gerçek Google Ads kimliğini ve iki mağaza etiketini kullanır; Apple pt boş', () => {
    const page = boot('?gclid=1');
    expect(page.consent.hidden).toBe(false);
    expect(page.appended).toHaveLength(0);
    // pt boş: App Store bağlantısı etiketsiz kalır.
    expect(href(page.links, 'appstore').toString()).toBe(APP_STORE);

    (document.getElementById('consent-accept') as HTMLButtonElement).click();
    expect(page.appended[0]?.src).toContain('gtag/js?id=AW-17557137727');

    const play = page.links.find((a) => a.dataset.store === 'play');
    const apple = page.links.find((a) => a.dataset.store === 'appstore');
    play?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    apple?.dispatchEvent(new MouseEvent('click', { cancelable: true }));
    expect(page.conversions().map((entry) => (entry[2] as { send_to: string }).send_to)).toEqual([
      'AW-17557137727/0KTjCPSfi7sdEL_S8rNB',
      'AW-17557137727/j0K-CPCdg7sdEL_S8rNB',
    ]);
  });

  it('izin kutusu reklam ölçümü açıklama sayfasına bağlanır', () => {
    boot();
    const link = document.querySelector<HTMLAnchorElement>('#consent a');
    expect(link?.getAttribute('href')).toBe('/tanitim/gizlilik.html');
    expect(document.querySelector('footer a[href="/tanitim/gizlilik.html"]')).not.toBeNull();
  });
});

describe('reklam ölçümü açıklama sayfası (/tanitim/gizlilik.html)', () => {
  const privacy = readFileSync(resolve(process.cwd(), 'public/tanitim/gizlilik.html'), 'utf8');

  it('hiçbir reklam veya analitik betiği yüklemez', () => {
    expect(privacy).not.toMatch(/googletagmanager|gtag\(|google-analytics|fbq\(/);
    expect(privacy.match(/<script[^>]*src=/g)).toBeNull();
  });

  it('açık izin, mağaza tıklaması, Google paylaşımı ve geri alma açıklanır; hukuk onayı iddiası yok', () => {
    expect(privacy).toContain('"Kabul et" seçmeden Google\'ın ölçüm betiği yüklenmez');
    expect(privacy).toContain('uygulamayı yüklediğiniz veya satın aldığınız anlamına gelmez');
    expect(privacy).toContain('Google ile paylaşılan veriler');
    expect(privacy).toContain('İzninizi geri almak');
    expect(privacy).toContain('https://teknovagroup.com/novalingo-gizlilik-politikasi');
    expect(privacy.toLowerCase()).not.toMatch(/hukuk(en|i)? onay|avukat onay|kvkk uyumlu/);
  });

  it('"İzni geri al" tercihi reddedildi olarak kaydeder', () => {
    const body = /<body>([\s\S]*)<\/body>/.exec(privacy)?.[1] ?? '';
    const script = body.slice(body.lastIndexOf('<script>') + 8, body.lastIndexOf('</script>'));
    document.body.innerHTML = body.slice(0, body.lastIndexOf('<script>'));
    localStorage.setItem('novalingo_ads_consent', 'granted');
    // eslint-disable-next-line @typescript-eslint/no-implied-eval
    new Function(script)();
    expect(document.getElementById('consent-status')?.textContent).toBe('izin verildi');
    (document.getElementById('withdraw') as HTMLButtonElement).click();
    expect(localStorage.getItem('novalingo_ads_consent')).toBe('denied');
    expect(document.getElementById('consent-status')?.textContent).toBe('izin verilmedi');
  });
});

describe('tanıtım sayfası — teklif metni', () => {
  it('ücretsiz plan sınırları uygulamadakiyle aynı', () => {
    expect(html).toContain(`Günde ${String(FREE_TIER.DAILY_LESSONS)} ders`);
    expect(html).toContain(`${String(FREE_TIER.MAX_CHILD_PROFILES)} çocuk profili`);
    expect(html).toContain("12 dünyanın ilk 4'ü");
  });

  it('uygulamaya reklam veya izleme SDK’sı eklenmedi; betik yalnız bu sayfada', () => {
    const appHtml = readFileSync(resolve(process.cwd(), 'index.html'), 'utf8');
    expect(appHtml).not.toContain('googletagmanager');
  });
});
