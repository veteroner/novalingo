/**
 * Logger
 *
 * Adım adım tanılama günlüğü. Amaç: native kabukta (iOS WKWebView / Android WebView)
 * neyin nerede patladığını Xcode / Logcat konsolundan okuyabilmek.
 *
 * Capacitor, webview'deki `console.*` çağrılarını native log'a köprüler; bu köprünün
 * release build'lerde de açık olması için `capacitor.config.ts` içinde
 * `loggingBehavior: 'production'` ayarlıdır.
 *
 * Tüm kayıtlar ayrıca bellek içi halka tampona yazılır — `formatLogBuffer()` ile
 * tek parça metin olarak dışa aktarılabilir (hata ekranındaki "Log'ları kopyala").
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  /** Unix epoch (ms) */
  ts: number;
  /** Uygulama açılışından bu yana geçen süre (ms) — adım sıralamasını okumak için */
  sinceBootMs: number;
  level: LogLevel;
  scope: string;
  message: string;
  /** Serileştirilmiş ek veri (ham nesne tutulmaz — bellek sızıntısı olmasın) */
  data?: string;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
};

/** Halka tamponun boyutu — hata ekranından paylaşılabilecek kadar, bellek yakmayacak kadar. */
const BUFFER_LIMIT = 500;

/** Değeri loglanmaması gereken anahtarlar (büyük/küçük harf duyarsız, parça eşleşmesi). */
const REDACTED_KEY_PATTERNS = [
  'apikey',
  'api_key',
  'token',
  'password',
  'secret',
  'authorization',
  'refreshtoken',
  'idtoken',
  'accesstoken',
  'credential',
];

const BOOT_TS = Date.now();

const buffer: LogEntry[] = [];

function resolveMinLevel(): LogLevel {
  const configured = import.meta.env.VITE_LOG_LEVEL;
  if (configured === 'debug' || configured === 'info' || configured === 'warn') return configured;
  if (configured === 'error' || configured === 'silent') return 'error';
  // Varsayılan: her yerde 'debug'. Tanılama değeri, sessizlikten daha kıymetli.
  return 'debug';
}

let minLevel: LogLevel = resolveMinLevel();

/** Çalışma anında seviye değiştirmek için (ör. konsoldan `window.novaLog.setLevel('warn')`). */
export function setLogLevel(level: LogLevel): void {
  minLevel = level;
}

function isRedactedKey(key: string): boolean {
  const lower = key.toLowerCase();
  return REDACTED_KEY_PATTERNS.some((pattern) => lower.includes(pattern));
}

/**
 * Ek veriyi tek satırlık, güvenli bir metne çevirir.
 * Döngüsel referanslar, Error nesneleri ve hassas anahtarlar burada ele alınır.
 */
function serialize(data: unknown): string | undefined {
  if (data === undefined) return undefined;

  const seen = new WeakSet<object>();

  try {
    return JSON.stringify(data, (key, value: unknown) => {
      if (key !== '' && isRedactedKey(key)) return '[redacted]';

      if (value instanceof Error) {
        return {
          name: value.name,
          message: value.message,
          // `cause` çoğu Firebase hatasında asıl sebebi taşır
          cause: value.cause instanceof Error ? value.cause.message : undefined,
          stack: value.stack?.split('\n').slice(0, 6).join(' | '),
        };
      }

      if (typeof value === 'object' && value !== null) {
        if (seen.has(value)) return '[circular]';
        seen.add(value);
      }

      if (typeof value === 'bigint') return value.toString();
      if (typeof value === 'function') return '[function]';

      return value;
    });
  } catch {
    return '[unserializable]';
  }
}

function write(level: LogLevel, scope: string, message: string, data?: unknown): void {
  if (LEVEL_ORDER[level] < LEVEL_ORDER[minLevel]) return;

  const serialized = serialize(data);
  const sinceBootMs = Date.now() - BOOT_TS;

  const entry: LogEntry = {
    ts: Date.now(),
    sinceBootMs,
    level,
    scope,
    message,
    ...(serialized === undefined ? {} : { data: serialized }),
  };

  buffer.push(entry);
  if (buffer.length > BUFFER_LIMIT) buffer.shift();

  // Native köprü nesneleri güvenilir biçimde göstermediği için ek veriyi
  // doğrudan metne gömüyoruz — Xcode konsolunda tek satır olarak okunur.
  const line = `[NL +${String(sinceBootMs)}ms][${scope}] ${message}${
    serialized === undefined ? '' : ` ${serialized}`
  }`;

  // Bu modül `no-console` kuralının kasıtlı istisnası: native log köprüsüne çıkan
  // tek nokta burası, uygulamanın geri kalanı `createLogger()` kullanır.
  if (level === 'error') console.error(line);
  else if (level === 'warn') console.warn(line);
  // eslint-disable-next-line no-console
  else if (level === 'info') console.info(line);
  // eslint-disable-next-line no-console
  else console.log(line);
}

export interface ScopedLogger {
  debug: (message: string, data?: unknown) => void;
  info: (message: string, data?: unknown) => void;
  warn: (message: string, data?: unknown) => void;
  error: (message: string, data?: unknown) => void;
  /** Akış adımlarını işaretlemek için `info` kısayolu — `▶` öneki ile göze çarpar. */
  step: (message: string, data?: unknown) => void;
}

/** Bir alan/servis için önekli logger üretir. Örn: `const log = createLogger('firebase')`. */
export function createLogger(scope: string): ScopedLogger {
  return {
    debug: (message, data) => {
      write('debug', scope, message, data);
    },
    info: (message, data) => {
      write('info', scope, message, data);
    },
    warn: (message, data) => {
      write('warn', scope, message, data);
    },
    error: (message, data) => {
      write('error', scope, message, data);
    },
    step: (message, data) => {
      write('info', scope, `▶ ${message}`, data);
    },
  };
}

/** Tampondaki kayıtların kopyası (en eskiden en yeniye). */
export function getLogBuffer(): LogEntry[] {
  return [...buffer];
}

/** Tamponu paylaşılabilir düz metne çevirir. */
export function formatLogBuffer(): string {
  return buffer
    .map((entry) => {
      const time = new Date(entry.ts).toISOString().slice(11, 23);
      const level = entry.level.toUpperCase().padEnd(5);
      return `${time} +${String(entry.sinceBootMs)}ms ${level} [${entry.scope}] ${entry.message}${
        entry.data === undefined ? '' : ` ${entry.data}`
      }`;
    })
    .join('\n');
}

/** Tamponu boşaltır (testlerde ve manuel tanılamada işe yarar). */
export function clearLogBuffer(): void {
  buffer.length = 0;
}

const globalLog = createLogger('global');

let globalHandlersInstalled = false;

/**
 * Yakalanmamış hataları ve reddedilen promise'leri log'a düşürür.
 * React ağacı hiç mount olmadan patlarsa tek tanılama kaynağımız budur.
 */
export function installGlobalErrorHandlers(): void {
  if (globalHandlersInstalled) return;
  globalHandlersInstalled = true;

  window.addEventListener('error', (event) => {
    globalLog.error('window.onerror', {
      message: event.message,
      source: event.filename,
      line: event.lineno,
      column: event.colno,
      error: event.error instanceof Error ? event.error : String(event.error),
    });
  });

  window.addEventListener('unhandledrejection', (event) => {
    globalLog.error('unhandledrejection', {
      reason: event.reason instanceof Error ? event.reason : String(event.reason),
    });
  });

  // Tarayıcı konsolundan elle inceleme için
  (window as unknown as Record<string, unknown>).novaLog = {
    dump: formatLogBuffer,
    entries: getLogBuffer,
    clear: clearLogBuffer,
    setLevel: setLogLevel,
  };
}
