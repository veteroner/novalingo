/**
 * Konuşma Tanıma API Seçici (STT)
 *
 * Web tarayıcılarda `webkitSpeechRecognition` kullanılır; ancak bu API
 * **iOS WKWebView'de ve Android System WebView'de çalışmaz** — native Capacitor
 * kabuğunda mikrofon açılır ama hiçbir sonuç dönmeden zaman aşımına düşer.
 *
 * Bu modül, native platformlarda `@capacitor-community/speech-recognition`
 * plugin'ini (iOS: `SFSpeechRecognizer`, Android: `SpeechRecognizer`) Web Speech
 * API yüzeyine uyarlar. Böylece tüketici bileşenler (ConversationActivity,
 * SpeakItActivity) tek bir `SpeechRecognitionAPI` kullanmaya devam eder.
 *
 * ── Neden kısmi sonuç (partialResults) modu? ──
 * Plugin'in `partialResults: false` modunda `start()` promise'i yalnızca
 * SFSpeechRecognizer bir sonuç ürettiğinde çözülür. Mikrofona hiç ses akmazsa
 * (iOS'ta TTS oynatımından sonra ses oturumu çakışması) promise **hiç
 * çözülmez** — kullanıcıya 12 saniye sessiz bir asılma olarak yansır.
 *
 * Kısmi sonuç modunda `start()` motor açılır açılmaz çözülür ve her ara sonuç
 * bir olay olarak gelir. Böylece mikrofona ses akıp akmadığını ölçebiliyoruz:
 * belirli sürede hiç kısmi sonuç yoksa oturum ölüdür → bir kez otomatik yeniden
 * denenir, yine ölüyse gerçek bir hata yayınlanır (sessiz asılma yerine).
 *
 * Tüm ses cihazda işlenir — COPPA uyumlu.
 */
import { createLogger } from '@/utils/logger';
import { Capacitor, type PluginListenerHandle } from '@capacitor/core';
import { SpeechRecognition as NativeRecognitionPlugin } from '@capacitor-community/speech-recognition';

const log = createLogger('stt-native');

/** Bu süre içinde hiç kısmi sonuç gelmezse mikrofona ses akmıyor demektir. */
const NO_AUDIO_TIMEOUT_MS = 4500;
/** Son kısmi sonuçtan sonra bu kadar sessizlik = çocuk konuşmayı bitirdi. */
const SILENCE_END_MS = 1800;
/** Bir oturum hiçbir koşulda bundan uzun sürmez. */
const MAX_SESSION_MS = 15_000;
/** Ölü oturum sonrası yeniden denemeden önce ses oturumunun boşalması için bekleme. */
const RESTART_DELAY_MS = 400;

/** onresult olayında tüketicinin okuduğu minimal alternatif şekli. */
interface ResultAlternativeLike {
  transcript: string;
  confidence: number;
}

/**
 * Native eşleşmeleri Web Speech API `SpeechRecognitionEvent`'ine dönüştürür.
 * Tüketiciler yalnızca `event.results[0]` üzerinden `.length`, `[i]` ve
 * `.transcript` okur — bir dizi bu arayüzü karşılar.
 */
function buildResultEvent(matches: string[]): SpeechRecognitionEvent {
  const alternatives: ResultAlternativeLike[] = matches.map((transcript) => ({
    transcript,
    confidence: 1,
  }));
  return { results: [alternatives], resultIndex: 0 } as unknown as SpeechRecognitionEvent;
}

/**
 * Native Capacitor kabuğunda Web Speech API `SpeechRecognition` arayüzünün
 * bileşenlerce kullanılan alt kümesini taklit eden adaptör.
 */
class NativeSpeechRecognition {
  lang = 'en-US';
  continuous = false;
  interimResults = false;
  maxAlternatives = 5;

  onstart: (() => void) | null = null;
  onend: (() => void) | null = null;
  onerror: ((event: { error: string }) => void) | null = null;
  onresult: ((event: SpeechRecognitionEvent) => void) | null = null;

  private aborted = false;
  private finished = false;
  private startNotified = false;
  private retried = false;
  private matches: string[] = [];
  private handles: PluginListenerHandle[] = [];
  private noAudioTimer: ReturnType<typeof setTimeout> | null = null;
  private silenceTimer: ReturnType<typeof setTimeout> | null = null;
  private maxTimer: ReturnType<typeof setTimeout> | null = null;

  /**
   * Oturum artık sonuç yayınlamamalı mı? `abort()` bir `await` sırasında
   * durumu değiştirebildiği için metot içine sarılıdır — aksi halde tip
   * daraltma await sonrası kontrolü "her zaman false" sayar.
   */
  private isCancelled(): boolean {
    return this.aborted || this.finished;
  }

  start(): void {
    this.aborted = false;
    this.finished = false;
    this.startNotified = false;
    this.retried = false;
    this.matches = [];
    void this.run();
  }

  private async run(): Promise<void> {
    try {
      let status = await NativeRecognitionPlugin.checkPermissions();
      if (status.speechRecognition !== 'granted') {
        status = await NativeRecognitionPlugin.requestPermissions();
      }
      if (status.speechRecognition !== 'granted') {
        log.warn('izin verilmedi', { status: status.speechRecognition });
        this.emitError('not-allowed');
        return;
      }

      if (this.isCancelled()) return;
      await this.attachListeners();
      if (this.isCancelled()) {
        await this.detachListeners();
        return;
      }

      // Kısmi sonuç modunda bu promise motor açılır açılmaz çözülür.
      await NativeRecognitionPlugin.start({
        language: this.lang,
        maxResults: Math.max(1, this.maxAlternatives),
        partialResults: true,
        popup: false,
      });

      if (this.isCancelled()) return;
      this.notifyStart();
      this.armNoAudioTimer();
      this.armMaxTimer();
    } catch (error) {
      if (this.isCancelled()) return;
      // Plugin "Ongoing speech recognition" ile reddedebilir — önceki oturum
      // native tarafta kapanmamış demektir; bir kez temizleyip yeniden dene.
      const message = error instanceof Error ? error.message : String(error);
      log.warn('native start hatası', { message, retried: this.retried });
      if (!this.retried) {
        void this.restart('start-rejected');
        return;
      }
      this.emitError('audio-capture');
    }
  }

  private async attachListeners(): Promise<void> {
    const partial = await NativeRecognitionPlugin.addListener('partialResults', (data) => {
      const incoming = data.matches.filter((m) => m.trim().length > 0);
      if (incoming.length === 0) return;
      this.matches = incoming;
      // Ses akıyor: ölü-mikrofon bekçisini kapat, sessizlik sayacını yenile.
      this.clearTimer('noAudio');
      this.armSilenceTimer();
    });
    const state = await NativeRecognitionPlugin.addListener('listeningState', (data) => {
      log.debug('native dinleme durumu', { status: data.status });
      if (data.status === 'started') this.notifyStart();
    });
    this.handles.push(partial, state);
  }

  private async detachListeners(): Promise<void> {
    const handles = this.handles;
    this.handles = [];
    for (const handle of handles) {
      await handle.remove().catch(() => undefined);
    }
  }

  private notifyStart(): void {
    if (this.startNotified || this.isCancelled()) return;
    this.startNotified = true;
    this.onstart?.();
  }

  private armNoAudioTimer(): void {
    this.clearTimer('noAudio');
    this.noAudioTimer = setTimeout(() => {
      if (this.isCancelled()) return;
      // Motor açıldı ama hiç ses gelmedi — iOS'ta TTS sonrası ses oturumu
      // çakışmasının imzası. Bir kez yeniden dene, sonra gerçek hata ver.
      log.warn('mikrofona ses akmıyor', { retried: this.retried });
      if (!this.retried) {
        void this.restart('no-audio');
        return;
      }
      this.emitError('audio-capture');
    }, NO_AUDIO_TIMEOUT_MS);
  }

  private armSilenceTimer(): void {
    this.clearTimer('silence');
    this.silenceTimer = setTimeout(() => {
      void this.finalize('silence');
    }, SILENCE_END_MS);
  }

  private armMaxTimer(): void {
    this.clearTimer('max');
    this.maxTimer = setTimeout(() => {
      void this.finalize('max-duration');
    }, MAX_SESSION_MS);
  }

  private clearTimer(which: 'noAudio' | 'silence' | 'max' | 'all'): void {
    if ((which === 'noAudio' || which === 'all') && this.noAudioTimer) {
      clearTimeout(this.noAudioTimer);
      this.noAudioTimer = null;
    }
    if ((which === 'silence' || which === 'all') && this.silenceTimer) {
      clearTimeout(this.silenceTimer);
      this.silenceTimer = null;
    }
    if ((which === 'max' || which === 'all') && this.maxTimer) {
      clearTimeout(this.maxTimer);
      this.maxTimer = null;
    }
  }

  /** Ölü oturumu tamamen kapatıp bir kez yeniden başlat. */
  private async restart(reason: string): Promise<void> {
    if (this.isCancelled() || this.retried) return;
    this.retried = true;
    log.step('oturum yeniden başlatılıyor', { reason });
    this.clearTimer('all');
    await NativeRecognitionPlugin.stop().catch(() => undefined);
    await this.detachListeners();
    await new Promise((resolve) => setTimeout(resolve, RESTART_DELAY_MS));
    if (this.isCancelled()) return;
    await this.run();
  }

  /** Toplanan kısmi sonuçları nihai sonuç olarak yayınla. */
  private async finalize(reason: string): Promise<void> {
    if (this.isCancelled()) return;
    this.finished = true;
    this.clearTimer('all');
    await NativeRecognitionPlugin.stop().catch(() => undefined);
    await this.detachListeners();

    const transcripts = this.matches;
    log.step('oturum tamamlandı', { reason, best: transcripts[0] ?? null });
    if (transcripts.length === 0) {
      this.onerror?.({ error: 'no-speech' });
      this.onend?.();
      return;
    }
    this.onresult?.(buildResultEvent(transcripts));
    this.onend?.();
  }

  private emitError(error: string): void {
    if (this.finished) return;
    this.finished = true;
    this.clearTimer('all');
    void NativeRecognitionPlugin.stop().catch(() => undefined);
    void this.detachListeners();
    this.onerror?.({ error });
    this.onend?.();
  }

  /** Web `abort()` karşılığı — anında durdur, bekleyen sonucu yok say. */
  abort(): void {
    this.clearTimer('all');
    void NativeRecognitionPlugin.stop().catch(() => undefined);
    void this.detachListeners();
    if (this.finished) return;
    this.aborted = true;
    this.finished = true;
    this.onend?.();
  }

  /** Web `stop()` karşılığı — nazikçe bitir, toplanan sonucu yayınla. */
  stop(): void {
    void this.finalize('manual-stop');
  }
}

/** Native platformda konuşma tanıma plugin'i derlenip kayıtlı mı? */
function isNativeRecognitionAvailable(): boolean {
  return Capacitor.isNativePlatform() && Capacitor.isPluginAvailable('SpeechRecognition');
}

/** Web tarayıcı `SpeechRecognition` yapıcısı (varsa). */
const WebSpeechRecognitionCtor: (new () => SpeechRecognition) | undefined =
  typeof window !== 'undefined'
    ? (((window as unknown as Record<string, unknown>).SpeechRecognition ??
        (window as unknown as Record<string, unknown>).webkitSpeechRecognition) as
        | (new () => SpeechRecognition)
        | undefined)
    : undefined;

/**
 * Platforma göre seçilmiş konuşma tanıma yapıcısı.
 * Native → plugin adaptörü, web → `webkitSpeechRecognition`, hiçbiri → `undefined`.
 *
 * `undefined` ise bileşenler mikrofon düğmesini gizler / manuel giriş fallback'ine düşer.
 */
export const SpeechRecognitionAPI: (new () => SpeechRecognition) | undefined =
  isNativeRecognitionAvailable()
    ? (NativeSpeechRecognition as unknown as new () => SpeechRecognition)
    : WebSpeechRecognitionCtor;
