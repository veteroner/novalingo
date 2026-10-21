/**
 * Çocukların kullandığı uygulamada üçüncü taraf hata/oturum telemetrisi başlatılmaz.
 * Hata sınırları SDK çağrılarını korur; init edilmediği için ağ aktarımı yapılmaz.
 * Tanılama için cihazdaki logger kullanılır.
 */
import * as Sentry from '@sentry/react';
export { Sentry };
