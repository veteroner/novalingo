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

- [ ] `generateConversation()` içine feature-flag destekli scenario selector entegrasyonu ekle
- [ ] Yeni selector başarısız olursa legacy `findBestTemplate()` fallback’i bırak
- [ ] Mapper çıktısının mevcut `ConversationActivity` ile sorunsuz çalıştığını doğrula
- [ ] Phase 1’in ilk 5 senaryosunu tek tek smoke test et

### 1.2 Validation Katmanı

- [ ] `validateConversationScenario.ts` dosyasını oluştur
- [ ] Node id benzersizlik testi yaz
- [ ] Geçerli `nextNodeId` testi yaz
- [ ] En az bir terminal node testi yaz
- [ ] Required metadata testi yaz
- [ ] Response rule boşluk ve duplicate variant testi yaz

### 1.3 Test Kapsamı

- [ ] `scenarioIndex` için registry testleri yaz
- [ ] `selectConversationScenario` için seçim testleri yaz
- [ ] `toConversationActivityData` için mapper testleri yaz
- [ ] İlk 5 senaryonun graph validasyon testlerini yaz

---

## Faz 2: Runtime Ayrıştırma

### 2.1 Matching Motoru

- [ ] `matchConversationResponse.ts` oluştur
- [ ] `ConversationActivity` içindeki free-form matching mantığını runtime helper’a taşı
- [ ] Response rule bazlı match sonucu tipi tanımla
- [ ] Repair ve hint kararını node metadata’sından okut

### 2.2 Completion ve Scoring

- [ ] Scenario-level success criteria değerlendirme helper’ı yaz
- [ ] `targetWords` bazlı kaba skor yerine scenario scoring kuralı ekle
- [ ] Hint ile tamamlanan cevaplar için farklı scoring kuralı tanımla

### 2.3 Analytics Hook’ları

- [ ] `conversation_started` eventini emit et
- [ ] `conversation_turn_completed` eventini emit et
- [ ] `conversation_hint_shown` eventini emit et
- [ ] `conversation_repair_prompt_used` eventini emit et
- [ ] `conversation_completed` eventini emit et

---

## Faz 3: İçerik Genişletme

### 3.1 Phase 1A İçerikleri

- [ ] Senaryo 6-10 için gerçek TS içerik dosyalarını ekle
- [ ] Her senaryo için en az 2 varyant ekle
- [ ] Yaş bandı ve zorluk dağılımını tekrar dengele

### 3.2 Phase 1B İçerikleri

- [ ] Senaryo 11-20 için gerçek TS içerik dosyalarını ekle
- [ ] Stretch senaryoları için daha güçlü repair akışı yaz
- [ ] Mission senaryoları için reward hook alanlarını netleştir

### 3.3 İçerik Yazım Standardizasyonu

- [ ] Script brief şablonu oluştur
- [ ] Content review checklist oluştur
- [ ] İçerik yazarları için örnek senaryo dosyası oluştur

---

## Faz 4: Selector Motorunu Güçlendirme

### 4.1 Akıllı Seçim

- [ ] Age band uyum skorunu iyileştir
- [ ] Difficulty uyum skorunu iyileştir
- [ ] Repetition penalty ekle
- [ ] Novelty bonus ekle
- [ ] Theme bias ve recent history entegrasyonu ekle

### 4.2 Kişiselleştirme

- [ ] Çocuğun son başarı oranına göre scenario difficulty seç
- [ ] En çok zorlandığı kalıpları yeniden döndür
- [ ] Tercih edilen tema etiketlerine göre öneri yap

---

## Faz 5: UI ve UX İyileştirme

### 5.1 Scenario-Aware UI

- [ ] Konuşma başında scenario summary gösterimi değerlendir
- [ ] Mission senaryoları için görev header’ı ekle
- [ ] Story senaryoları için episode göstergesi ekle
- [ ] Reward tipi bazlı son ekran varyantları tasarla

### 5.2 Hint ve Repair Görselleştirmesi

- [ ] Pattern reveal kartı tasarla
- [ ] Repair prompt’lar için daha net konuşma yardımı tasarla
- [ ] Mikrofon ve yazı modları arasında yönlendirici ipuçları ekle

---

## Faz 6: Legacy Sunset

### 6.1 Legacy Kullanımını Azalt

- [ ] Yeni registry’nin kapsadığı tema sayısını ölç
- [ ] Legacy template kullanım oranını analitikte izle
- [ ] Registry yeterli kapsama ulaştığında yeni derslerde legacy kullanımını kapat

### 6.2 Son Temizlik

- [ ] `findBestTemplate()` kullanım alanlarını temizle
- [ ] `conversationTemplates.ts` dosyasını legacy fallback veya test fixture olarak ayır
- [ ] Node echo geçişini tamamen runtime mapper’dan native runtime’a taşı

---

## Öncelikli Sıradaki Kod İşleri

İlk uygulanması gereken 5 teknik adım:

1. `generateConversation()` için selector + mapper entegrasyonu
2. `validateConversationScenario.ts` oluşturma
3. selector testleri
4. mapper testleri
5. Phase 1’in sonraki 5 senaryosu
