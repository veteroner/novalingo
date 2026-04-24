# Nova ile Konuş Migration Task List

> Amaç: Legacy template sisteminden yeni registry tabanlı konuşma sistemine kontrollü geçiş için uygulanabilir görev listesi
> Tarih: 22 Mart 2026

---

## Faz 0: Temel Hazırlık

### 0.1 Dokümantasyon Temeli

- [x] Ürün planı oluştur
- [x] Phase 1 senaryo backlog’unu çıkar
- [x] İçerik schema tasarımını yaz
- [x] Template sistem teknik tasarımını yaz
- [x] Migration görev listesini oluştur

### 0.2 Kod İskeleti

- [x] `conversationScenario.ts` tiplerini ekle
- [x] `scenarioIndex.ts` registry index dosyasını aç
- [x] `selectConversationScenario.ts` selector iskeletini aç
- [x] `toConversationActivityData.ts` compat mapper iskeletini aç
- [x] İlk 5 Phase 1 senaryosunu gerçek TS dosyaları olarak ekle

---

## Faz 1: Registry Pilot

### 1.1 İlk Pilot Entegrasyon

- [x] `generateConversation()` içine feature-flag destekli scenario selector entegrasyonu ekle
- [x] Yeni selector başarısız olursa legacy `findBestTemplate()` fallback'i bırak
- [x] Mapper çıktısının mevcut `ConversationActivity` ile sorunsuz çalıştığını doğrula
- [x] Phase 1'in ilk 5 senaryosunu tek tek smoke test et _(Playwright + manuel dev-mode smoke — `scenarioIndex` regression test + 5 senaryo validator pass)_

### 1.2 Validation Katmanı

- [x] `validateConversationScenario.ts` dosyasını oluştur
- [x] Node id benzersizlik testi yaz
- [x] Geçerli `nextNodeId` testi yaz
- [x] En az bir terminal node testi yaz
- [x] Required metadata testi yaz
- [x] Response rule boşluk ve duplicate variant testi yaz

### 1.3 Test Kapsamı

- [x] `scenarioIndex` için registry testleri yaz
- [x] `selectConversationScenario` için seçim testleri yaz
- [x] `toConversationActivityData` için mapper testleri yaz
- [x] İlk 5 senaryonun graph validasyon testlerini yaz

---

## Faz 2: Runtime Ayrıştırma

### 2.1 Matching Motoru

- [x] `matchConversationResponse.ts` oluştur
- [x] `ConversationActivity` içindeki free-form matching mantığını runtime helper'a taşı
- [x] Response rule bazlı match sonucu tipi tanımla
- [x] Repair ve hint kararını node metadata'sından okut

### 2.2 Completion ve Scoring

- [x] Scenario-level success criteria değerlendirme helper'ı yaz
- [x] `targetWords` bazlı kaba skor yerine scenario scoring kuralı ekle
- [x] Hint ile tamamlanan cevaplar için farklı scoring kuralı tanımla

### 2.3 Analytics Hook’ları

- [x] `conversation_started` eventini emit et
- [x] `conversation_turn_completed` eventini emit et
- [x] `conversation_hint_shown` eventini emit et
- [x] `conversation_repair_prompt_used` eventini emit et
- [x] `conversation_completed` eventini emit et

---

## Faz 3: İçerik Genişletme

### 3.1 Phase 1A İçerikleri

- [x] Senaryo 6-10 için gerçek TS içerik dosyalarını ekle
- [x] Her senaryo için en az 2 varyant ekle
- [x] Yaş bandı ve zorluk dağılımını tekrar dengele _(phase5 priority6/priority7 expansion'ları + selector difficulty scoring — pilot verisi geldiğinde fine-tune)_

### 3.2 Phase 1B İçerikleri

- [x] Senaryo 11-20 için gerçek TS içerik dosyalarını ekle
- [x] Stretch senaryoları için daha güçlü repair akışı yaz
- [x] Mission senaryoları için reward hook alanlarını netleştir _(scenario reward artık `submitLessonResult` → XP/stars/quest progress üzerinden, mission-specific hook gerekmiyor)_

### 3.3 İçerik Yazım Standardizasyonu

- [x] Script brief şablonu oluştur
- [x] Content review checklist oluştur
- [x] İçerik yazarları için örnek senaryo dosyası oluştur

---

## Faz 4: Selector Motorunu Güçlendirme

### 4.1 Akıllı Seçim

- [x] Age band uyum skorunu iyileştir
- [x] Difficulty uyum skorunu iyileştir
- [x] Repetition penalty ekle
- [x] Novelty bonus ekle
- [x] Theme bias ve recent history entegrasyonu ekle

### 4.2 Kişiselleştirme

- [x] Çocuğun son başarı oranına göre scenario difficulty seç
- [x] En çok zorlandığı kalıpları yeniden döndür
- [x] Tercih edilen tema etiketlerine göre öneri yap

---

## Faz 5: UI ve UX İyileştirme

### 5.1 Scenario-Aware UI

- [x] Konuşma başında scenario summary gösterimi değerlendir
- [x] Mission senaryoları için görev header'ı ekle
- [ ] Story senaryoları için episode göstergesi ekle _(UI polish — v1.1 içerik genişlemesinde ele alınacak)_
- [ ] Reward tipi bazlı son ekran varyantları tasarla

### 5.2 Hint ve Repair Görselleştirmesi

- [x] Pattern reveal kartı tasarla
- [ ] Repair prompt'lar için daha net konuşma yardımı tasarla
- [x] Mikrofon ve yazı modları arasında yönlendirici ipuçları ekle

---

## Faz 6: Legacy Sunset

### 6.1 Legacy Kullanımını Azalt

- [ ] Yeni registry’nin kapsadığı tema sayısını ölç
- [x] Legacy template kullanım oranını analitikte izle
- [ ] Registry yeterli kapsama ulaştığında yeni derslerde legacy kullanımını kapat

### 6.2 Son Temizlik

- [x] `findBestTemplate()` kullanım alanlarını temizle
- [x] `conversationTemplates.ts` dosyasını legacy fallback veya test fixture olarak ayır
- [ ] Node echo geçişini tamamen runtime mapper’dan native runtime’a taşı

---

## Öncelikli Sıradaki Kod İşleri

Aşağıdaki 5 adım tamamlandı:

1. ~~`generateConversation()` için selector + mapper entegrasyonu~~ ✅
2. ~~`validateConversationScenario.ts` oluşturma~~ ✅
3. ~~selector testleri~~ ✅
4. ~~mapper testleri~~ ✅
5. ~~Phase 1'in sonraki 5 senaryosu~~ ✅

Kalan işler:

1. Phase 1 senaryolarını cihazda smoke test et
2. Story senaryoları için episode göstergesi ekle
3. Reward tipi bazlı son ekran varyantlarını tasarla
4. Repair prompt görselleştirmesini iyileştir
5. Registry kapsama oranı yeterli olduğunda production flag'ını aç
