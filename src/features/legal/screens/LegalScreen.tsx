/**
 * LegalScreen
 *
 * Privacy Policy ve Terms of Service ekranı.
 * Herkese açık route — giriş gerekmez.
 * App Store & Google Play zorunlu gereksinim.
 */

import { ArrowLeft, BookOpen, ShieldCheck } from '@phosphor-icons/react';
import { useNavigate, useParams } from 'react-router-dom';

type LegalType = 'privacy' | 'terms';

const LAST_UPDATED = '8 Nisan 2026';
const APP_NAME = 'NovaLingo';
const COMPANY = 'NovaLingo';
const CONTACT_EMAIL = 'privacy@novalingo.app';

function PrivacyPolicy() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-gray-700">
      <p className="text-xs text-gray-500">Son güncelleme: {LAST_UPDATED}</p>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">1. Veri Sorumlusu</h2>
        <p>
          {APP_NAME} uygulamasının veri sorumlusu {COMPANY}&apos;dur. Bu gizlilik politikası, 6698
          sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve AB Genel Veri Koruma Yönetmeliği
          (GDPR) kapsamında hazırlanmıştır.
        </p>
        <p className="mt-2">
          İletişim: <strong>{CONTACT_EMAIL}</strong>
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">2. Çocuk Gizliliği (COPPA)</h2>
        <p>
          {APP_NAME}, 13 yaş altı çocuklar için tasarlanmıştır. Çocukların kişisel verilerini
          korumayı en yüksek öncelik olarak kabul ediyoruz.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>13 yaş altı hesaplar yalnızca ebeveyn/vasi onayıyla oluşturulabilir.</li>
          <li>Çocukların e-posta adresi veya gerçek adı sistemde saklanmaz.</li>
          <li>Profil adı ve yaş yalnızca kişiselleştirme amacıyla kullanılır.</li>
          <li>Çocuk verileri üçüncü taraflarla paylaşılmaz ve reklamlara kullanılmaz.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">3. Topladığımız Veriler</h2>
        <div className="space-y-3">
          <div>
            <h3 className="font-semibold text-gray-800">Ebeveyn Hesabı</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>E-posta adresi (kimlik doğrulama için)</li>
              <li>Şifreli ebeveyn PIN (SHA-256 hash + salt, asla düz metin saklanmaz)</li>
              <li>Uygulama içi satın alma geçmişi (Apple/Google üzerinden)</li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Çocuk Profili</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Profil adı (takma ad, gerçek isim zorunlu değil)</li>
              <li>Yaş (seviye kişiselleştirme için)</li>
              <li>Öğrenme ilerlemesi, tamamlanan dersler, puan geçmişi</li>
              <li>
                Konuşma pratiği ses kayıtları — yalnızca cihazda işlenir, sunucuya gönderilmez
              </li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-gray-800">Otomatik Toplanan Veriler</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              <li>Ders tamamlama istatistikleri ve oturum süreleri</li>
              <li>Hata raporları (Sentry — anonim, cihaz bilgisi içerebilir)</li>
              <li>Firebase Analytics — toplu kullanım istatistikleri, anonim</li>
            </ul>
          </div>
        </div>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">4. Verilerin Kullanımı</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Kişiselleştirilmiş öğrenme deneyimi sunmak</li>
          <li>Tekrarlı öğrenme (SRS) algoritmasını çalıştırmak</li>
          <li>Ebeveyn ilerleme raporları oluşturmak</li>
          <li>Uygulama hatalarını tespit etmek ve düzeltmek</li>
          <li>Yasal yükümlülükleri yerine getirmek</li>
        </ul>
        <p className="mt-2 font-medium text-gray-800">
          Verileriniz: reklam hedefleme, profil satışı veya üçüncü taraf pazarlama amacıyla
          kullanılmaz, paylaşılmaz veya satılmaz.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">5. Veri Saklama</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Aktif hesap verileri: hesap silinene kadar saklanır</li>
          <li>Hesap silme sonrası tüm çocuk profilleri 30 gün içinde kalıcı olarak silinir</li>
          <li>Anonim analitik veriler: 14 ay (Firebase Analytics varsayılanı)</li>
          <li>Hata logları: 90 gün (Sentry)</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">6. Üçüncü Taraf Hizmetler</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong>Google Firebase / Firestore:</strong> Kimlik doğrulama ve veri depolama. Google
            Gizlilik Politikası geçerlidir.
          </li>
          <li>
            <strong>Sentry:</strong> Anonim hata raporlama. Kişisel veri içermeyen teknik bilgiler.
          </li>
          <li>
            <strong>Apple App Store / Google Play:</strong> Ödeme işlemleri. Ödeme bilgileri
            doğrudan Apple/Google tarafından işlenir.
          </li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">
          7. Haklarınız (KVKK Madde 11 & GDPR)
        </h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Verilerinizin işlenip işlenmediğini öğrenme</li>
          <li>Verilerinize erişim ve kopyasını talep etme</li>
          <li>Hatalı verilerin düzeltilmesini isteme</li>
          <li>Verilerinizin silinmesini talep etme ("unutulma hakkı")</li>
          <li>Veri işlemeye itiraz etme hakkı</li>
        </ul>
        <p className="mt-2">
          Bu hakları kullanmak için: <strong>{CONTACT_EMAIL}</strong>
        </p>
        <p className="mt-1">
          Hesap silme işlemi uygulama içinden de yapılabilir: Ebeveyn Ayarları → Hesabı Sil
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">8. Güvenlik</h2>
        <p>
          Verileriniz Firebase güvenlik kuralları, App Check (uygulama doğrulama) ve şifreli
          iletişim (HTTPS/TLS) ile korunmaktadır. Ebeveyn PIN&apos;i asla düz metin olarak
          saklanmaz.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">9. Politika Değişiklikleri</h2>
        <p>
          Bu politikada önemli değişiklikler yapıldığında uygulama içi bildirim ve/veya e-posta ile
          bilgilendirileceksiniz. Güncel versiyon her zaman bu sayfada yayınlanır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">10. İletişim</h2>
        <p>
          Gizlilik ile ilgili her türlü soru ve talepleriniz için:
          <br />
          <strong>{CONTACT_EMAIL}</strong>
        </p>
      </section>
    </div>
  );
}

function TermsOfService() {
  return (
    <div className="space-y-6 text-sm leading-relaxed text-gray-700">
      <p className="text-xs text-gray-500">Son güncelleme: {LAST_UPDATED}</p>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">1. Hizmet Tanımı</h2>
        <p>
          {APP_NAME}, 3-8 yaş çocuklar için İngilizce öğretme uygulamasıdır. Uygulamayı indirerek
          veya kullanarak bu Kullanım Koşulları&apos;nı kabul etmiş sayılırsınız.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">2. Hesap Gereksinimleri</h2>
        <ul className="list-disc space-y-1 pl-5">
          <li>Ebeveyn/vasi hesabı için 18 yaş veya üzeri olunması gerekir.</li>
          <li>Çocuk profilleri yalnızca ebeveyn hesabı altında oluşturulabilir.</li>
          <li>Hesap bilgilerinizi gizli tutmakla sorumlusunuz.</li>
          <li>Her hesap yalnızca bir kişi/aile tarafından kullanılabilir.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">3. Ücretlendirme</h2>
        <p>
          {APP_NAME} ücretli bir uygulamadır. Satın alma işlemleri Apple App Store veya Google Play
          Store aracılığıyla gerçekleştirilir.
        </p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Tüm satın almalar platform mağazasının iade politikasına tabidir.</li>
          <li>iOS iade: App Store → Hesap → Satın Alımlar → İade Talep Et (48 saat içinde)</li>
          <li>Android iade: Google Play → Siparişler → İade Et (48 saat içinde)</li>
          <li>48 saat sonrası iadeler için {CONTACT_EMAIL} ile iletişime geçin.</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">4. Kullanım Kuralları</h2>
        <p>Aşağıdaki kullanımlar yasaktır:</p>
        <ul className="mt-2 list-disc space-y-1 pl-5">
          <li>Uygulamayı tersine mühendislik veya kaynak kodu çıkarma</li>
          <li>İçeriği kopyalama, çoğaltma veya dağıtma</li>
          <li>Otomatik araçlarla sisteme erişim sağlama</li>
          <li>Uygulamayı ticari amaçla kullanma</li>
          <li>Başkasının hesabını izinsiz kullanma</li>
        </ul>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">5. Fikri Mülkiyet</h2>
        <p>
          Tüm içerik, tasarım, ses dosyaları, karakterler ve kod {COMPANY}&apos;ya aittir.
          Uygulamanın satın alınması, içeriklerin mülkiyetini devretmez; yalnızca kişisel, ticari
          olmayan kullanım lisansı verir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">6. Sorumluluk Sınırlandırması</h2>
        <p>
          {APP_NAME}, makul özen göstererek hizmet sunmayı taahhüt eder. Ancak teknik aksaklıklar,
          veri kaybı veya kesintilerden doğabilecek zararlardan doğrudan sorumlu tutulamaz. Uygulama
          "olduğu gibi" sunulmaktadır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">7. Hizmet Değişiklikleri</h2>
        <p>
          {COMPANY}, önceden bildiri yaparak hizmetlerin içeriğini, fiyatlandırmasını veya
          özelliklerini değiştirme hakkını saklı tutar. Önemli değişikliklerde en az 30 gün
          öncesinden bildirim yapılır.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">8. Hesap Feshi</h2>
        <p>
          Koşulların ihlali durumunda hesabınız askıya alınabilir veya sonlandırılabilir. Hesabınızı
          istediğiniz zaman Ebeveyn Ayarları → Hesabı Sil seçeneğiyle silebilirsiniz.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">9. Uygulanacak Hukuk</h2>
        <p>
          Bu koşullar Türkiye Cumhuriyeti kanunlarına tabidir. Uyuşmazlıklar İstanbul mahkemelerinde
          çözümlenir.
        </p>
      </section>

      <section>
        <h2 className="mb-2 text-base font-bold text-gray-900">10. İletişim</h2>
        <p>
          Kullanım koşullarıyla ilgili sorularınız için:
          <br />
          <strong>{CONTACT_EMAIL}</strong>
        </p>
      </section>
    </div>
  );
}

export default function LegalScreen() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: LegalType }>();
  const legalType: LegalType = type === 'terms' ? 'terms' : 'privacy';

  const isPrivacy = legalType === 'privacy';

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-gray-100 bg-white px-4 py-4">
        <button
          onClick={() => navigate(-1)}
          className="rounded-full p-2 transition-colors hover:bg-gray-100"
          aria-label="Geri"
        >
          <ArrowLeft size={20} weight="bold" className="text-gray-700" />
        </button>
        <div className="flex items-center gap-2">
          {isPrivacy ? (
            <ShieldCheck size={20} className="text-nova-blue" />
          ) : (
            <BookOpen size={20} className="text-nova-blue" />
          )}
          <h1 className="text-base font-bold text-gray-900">
            {isPrivacy ? 'Gizlilik Politikası' : 'Kullanım Koşulları'}
          </h1>
        </div>
      </div>

      {/* Tab Switch */}
      <div className="flex border-b border-gray-100">
        <button
          onClick={() => navigate('/legal/privacy', { replace: true })}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            isPrivacy
              ? 'text-nova-blue border-nova-blue border-b-2'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Gizlilik Politikası
        </button>
        <button
          onClick={() => navigate('/legal/terms', { replace: true })}
          className={`flex-1 py-3 text-sm font-semibold transition-colors ${
            !isPrivacy
              ? 'text-nova-blue border-nova-blue border-b-2'
              : 'text-gray-400 hover:text-gray-600'
          }`}
        >
          Kullanım Koşulları
        </button>
      </div>

      {/* Scrollable Content */}
      <div className="flex-1 overflow-y-auto px-5 py-6">
        {isPrivacy ? <PrivacyPolicy /> : <TermsOfService />}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 bg-gray-50 px-5 py-4">
        <p className="text-center text-xs text-gray-400">
          {APP_NAME} · {CONTACT_EMAIL}
        </p>
      </div>
    </div>
  );
}
