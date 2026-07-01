/**
 * FirebaseConfigError
 *
 * Firebase başlatılamadığında (genelde eksik `VITE_FIREBASE_*` derleme
 * değişkenleri) uygulamayı çökertmek yerine gösterilen net hata ekranı.
 * Bilinçli olarak hiçbir Firebase/provider bağımlılığı içermez — çünkü tam da
 * o katman başarısız olduğunda render edilir. Metin, bu bir yapılandırma/deploy
 * hatası olduğu için Türkçe sabittir.
 */

interface FirebaseConfigErrorProps {
  error: Error;
}

export function FirebaseConfigError({ error }: FirebaseConfigErrorProps) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white px-6 text-center">
      <span className="text-5xl" aria-hidden="true">
        🛠️
      </span>
      <h1 className="text-xl font-bold text-gray-900">Uygulama şu an açılamıyor</h1>
      <p className="max-w-sm text-sm text-gray-600">
        Bir yapılandırma sorunu nedeniyle uygulama başlatılamadı. Lütfen birazdan tekrar dene. Sorun
        sürerse yöneticiye bildir.
      </p>
      <details className="mt-2 max-w-sm text-left">
        <summary className="cursor-pointer text-xs text-gray-400">Teknik detay</summary>
        <pre className="mt-2 overflow-x-auto rounded-lg bg-gray-100 p-3 text-xs whitespace-pre-wrap text-gray-500">
          {error.message}
        </pre>
      </details>
    </div>
  );
}
