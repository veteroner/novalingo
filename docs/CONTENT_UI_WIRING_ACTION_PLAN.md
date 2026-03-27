# Content And UI Wiring Action Plan

Bu doküman, mevcut içerik denetimini doğrudan uygulanabilir teknik iş listesine çevirir.

## Hedef

- Dünya kapsamını gerçekten erişilebilir hale getirmek.
- İçeriğin yanlış dünya veya yanlış akışta görünmesini engellemek.
- Yazılmış ama kullanılmayan içerik katmanlarını ürüne bağlamak.
- W5-W6 içerik boşluklarını kapatmak.

## Faz 0 — Kritik Düzeltmeler

### 1. World map sadece ilk üniteyi göstermesin

- Öncelik: Kritik
- Problem: World map Firestore'dan yalnızca ilk ünitenin derslerini çekiyor. Bu durumda dünya içinde kalan diğer üniteler görünmeyebilir.
- Dosyalar:
  - `src/features/home/screens/WorldMapScreen.tsx`
  - `src/hooks/queries/useLessonQueries.ts`
- Yapılacak işler:
  - `useLessons` yerine dünya içindeki tüm üniteleri yükleyen bir query ekle.
  - World map'te ders listesini tüm üniteler için birleştir.
  - Ders sırası bozulmadan tek path halinde render et.
  - Firestore verisi varsa fallback curriculum ile karışmayan tek bir kaynak stratejisi belirle.
- Kabul kriterleri:
  - Bir dünyanın tüm ünitelerindeki dersler map üzerinde görünür.
  - Ünite sayısı artsa bile path kırılmaz.
  - Tamamlanan ders sayısı yalnızca ilk üniteye göre hesaplanmaz.

### 2. Standalone conversation gerçekten world veya phase'e göre seçilsin

- Öncelik: Kritik
- Problem: World map `phase` gönderiyor ama conversation ekranı bunu kullanmıyor. Store da worldId alsa bile selector buna göre filtrelemiyor.
- Dosyalar:
  - `src/features/home/screens/WorldMapScreen.tsx`
  - `src/features/conversation/screens/ConversationScreen.tsx`
  - `src/stores/conversationStore.ts`
  - `src/features/learning/data/conversations/selectors/selectConversationScenario.ts`
  - `src/features/learning/data/conversations/types/conversationScenario.ts`
- Yapılacak işler:
  - `phase` query param desteğini ekle veya tamamen kaldırıp world tabanlı seçime geç.
  - Selector parametrelerine `worldId` veya `phase` filtresi ekle.
  - W1-W6 için selector içinde deterministik aday havuzu oluştur.
  - `preferredTheme` filtresi ile `world/phase` filtresinin birlikte çalışmasını sağla.
- Kabul kriterleri:
  - W3 içinden başlatılan konuşma yalnızca W3 kapsamındaki senaryolardan gelir.
  - Parent CTA ile gelen `theme` parametresi aynı dünya içinde çalışır.
  - World map'teki konuşma düğmesi yanlış fazdan senaryo açmaz.

### 3. Conversation route contract'ını sadeleştir

- Öncelik: Kritik
- Problem: Şu an `/conversation`, `/conversation?theme=...`, `/conversation?phase=...` aynı ekrana farklı kurallarla düşüyor.
- Dosyalar:
  - `src/features/conversation/screens/ConversationScreen.tsx`
  - `src/features/home/screens/HomeScreen.tsx`
  - `src/features/home/screens/WorldMapScreen.tsx`
  - `src/features/parent/screens/ParentDashboard.tsx`
- Yapılacak işler:
  - Tek bir route contract belirle: örneğin `world`, `phase`, `theme` opsiyonel ama desteklenen kombinasyonlar açık olsun.
  - Parametre öncelik sırası yaz: `theme + world`, sonra `phase`, sonra `child.currentWorldId`.
  - Geçersiz parametrelerde fallback davranışını sabitle.
- Kabul kriterleri:
  - Aynı konuşma route'u her giriş noktasında aynı kuralla çalışır.
  - Desteklenmeyen parametre kombinasyonlarında sessiz yanlış seçim yapılmaz.

## Faz 1 — İçerik Yüzeye Çıkarma

### 4. Hikayeler için bağımsız bir story browser ekle

- Öncelik: Yüksek
- Problem: Ana ekrandaki Hikayeler kartı, story kütüphanesi açmak yerine ilk uygun dersi açıyor.
- Dosyalar:
  - `src/features/home/screens/HomeScreen.tsx`
  - `src/app/Router.tsx`
  - yeni ekran: `src/features/learning/screens/StoryLibraryScreen.tsx`
  - `src/features/learning/data/storyBank.ts`
- Yapılacak işler:
  - Dünya, tema ve yaş bandına göre filtrelenebilen bir hikaye kütüphanesi ekranı ekle.
  - Story bank öğelerini kart halinde listele.
  - Hikaye açma akışını lesson bağımlılığından ayır veya story-time wrapper oluştur.
- Kabul kriterleri:
  - Kullanıcı hikayeleri ders dışında da keşfedebilir.
  - W1-W4 story içerikleri listelenir, filtrelenir ve açılır.

### 5. W5-W6 story bank içeriğini tamamla

- Öncelik: Yüksek
- Problem: Story bank sadece W1-W4 seviyesinde dolu. W5-W6 story-time dersleri içerik olarak geride kalıyor.
- Dosyalar:
  - `src/features/learning/data/storyBank.ts`
  - `src/features/learning/data/curriculum.ts`
  - `src/features/learning/data/activityGenerator.ts`
- Yapılacak işler:
  - W5 için en az 8-10 yeni mikro hikaye ekle.
  - W6 için en az 8-10 yeni mikro hikaye ekle.
  - Story seçimini `theme` yanında `worldId` ile de skorlayacak şekilde güçlendir.
- Kabul kriterleri:
  - W5-W6 story-time dersleri öncelikli olarak kendi dünya seviyesinden hikaye seçer.
  - Fallback olsa bile bir üst veya alt seviyeye kontrollü düşer.

### 6. W6 için ayrı conversation fazı veya net kapsam kararı ver

- Öncelik: Yüksek
- Problem: W6 şu an phase5'i tekrar kullanıyor.
- Dosyalar:
  - `src/features/learning/data/conversations/registry/`
  - `src/features/learning/data/conversations/registry/scenarioIndex.ts`
  - `src/features/home/screens/WorldMapScreen.tsx`
- Yapılacak işler:
  - Karar ver: W6 için `phase6` üretilecek mi, yoksa phase5 bilinçli olarak reuse mu edilecek?
  - Eğer reuse edilecekse UI'da bunu pedagojik tekrar olarak açıkça çerçevele.
  - Eğer ayrı faz açılacaksa en az 8-10 senaryo ekle.
- Kabul kriterleri:
  - W6 konuşma katmanı ürün kararına göre açık ve tutarlı hale gelir.

## Faz 2 — Ürüne Bağlanmamış İçerik Katmanları

### 7. Nova quip bank'i runtime'a bağla

- Öncelik: Orta
- Problem: Replik bankası yazılmış ama kullanım yok.
- Dosyalar:
  - `src/features/learning/data/novaQuipBank.ts`
  - `src/features/learning/components/activities/ConversationActivity.tsx`
  - `src/features/learning/screens/LessonResultScreen.tsx`
  - ilgili activity bileşenleri
- Yapılacak işler:
  - Doğru cevap, yanlış cevap, seri, lesson start, lesson complete gibi noktalara quip enjeksiyonu yap.
  - Aşırı tekrar etmemesi için küçük bir rotation veya cooldown mantığı kur.
- Kabul kriterleri:
  - En az 4 kullanıcı akışında quip bank'ten replik görülür.
  - Aynı replik arka arkaya spam olmaz.

### 8. Chunk bank'i gerçek ders üretimine bağla

- Öncelik: Orta
- Problem: Chunk bank export edilmiş ama lesson/activity üretiminde belirleyici değil.
- Dosyalar:
  - `src/features/learning/data/chunkBank.ts`
  - `src/features/learning/data/activityGenerator.ts`
  - `src/features/learning/screens/LessonResultScreen.tsx`
  - `src/hooks/queries/useParentQueries.ts`
- Yapılacak işler:
  - Lesson objective ve `chunks` alanlarını activity seçiminde kullan.
  - Ders sonu ekranında hangi kalıbın çalışıldığı gösterilsin.
  - Parent dashboard'da chunk bazlı ilerleme daha net raporlansın.
- Kabul kriterleri:
  - Chunk bank yalnızca veri deposu olmaktan çıkar.
  - Ders üretimi veya raporlama en az bir gerçek karar noktasında bu veriyi kullanır.

## Faz 3 — Kalite ve Gözlemlenebilirlik

### 9. İçerik kapsam doğrulama testleri ekle

- Öncelik: Orta
- Dosyalar:
  - `src/features/learning/data/__tests__/curriculum.validate.test.ts`
  - yeni testler: story bank coverage, world-to-conversation coverage, route param selection tests
- Yapılacak işler:
  - Her dünya için minimum story sayısı testi ekle.
  - Her dünya için conversation candidate availability testi ekle.
  - World map tüm üniteleri render ediyor mu testi ekle.
  - `/conversation` parametre kombinasyonları için selector testi ekle.
- Kabul kriterleri:
  - İçerik regressions CI'da yakalanır.

### 10. İçerik keşif ve kullanım analitiklerini ekle

- Öncelik: Düşük
- Dosyalar:
  - `src/services/analytics/analyticsService.ts`
  - `src/features/learning/screens/StoryLibraryScreen.tsx`
  - `src/features/conversation/screens/ConversationScreen.tsx`
- Yapılacak işler:
  - Hangi dünya içerikleri açılıyor, hangileri hiç açılmıyor izle.
  - Story open rate, conversation start rate, theme replay rate ölç.
- Kabul kriterleri:
  - İçeriğin sadece varlığı değil, tüketimi de ölçülebilir olur.

## Önerilen Uygulama Sırası

### Sprint 1

- World map tüm ünite sorununu düzelt.
- Conversation seçim akışını world veya phase bazında sabitle.
- Route param contract'ını sadeleştir.

### Sprint 2

- Story library ekranını çıkar.
- W5-W6 story bank genişletmesini yap.
- W6 konuşma stratejisini netleştir.

### Sprint 3

- Nova quip bank entegrasyonu.
- Chunk bank entegrasyonu.
- Kapsam regresyon testleri.

## Ürün Kararı Gerektiren Noktalar

- W6 gerçekten yeni bir konuşma seviyesi mi olacak, yoksa phase5 tekrar mı edecek?
- Hikayeler ders dışı bağımsız içerik yüzeyi mi olacak, yoksa sadece lesson destek materyali mi kalacak?
- Conversation seçiminde ana kural dünya mı olacak, tema mı olacak?

## Başarı Ölçütü

- Kullanıcı uygulamadaki tüm dünyaların tüm ünitelerine erişebiliyor.
- Her dünya kendi seviyesine uygun story ve conversation içeriği sunuyor.
- Yeni yazılan içerik bankaları gerçek kullanıcı akışında görünür hale geliyor.
- İçerik ekibinin ürettiği materyal ile kullanıcıya ulaşan materyal arasındaki fark minimuma iniyor.
