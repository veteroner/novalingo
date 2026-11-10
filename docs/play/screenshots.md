# App Store ve Google Play — Teslim edilen görseller

Görseller Git dışında, `/Users/onerozbey/Projects/novalingo-store-assets/` altında. `CODEX_ASSETS.md` görevi kapsamındaki çekimler `codex/play-store-listing` dalında tarayıcıda çalışan uygulamadan, yerel Firebase demo projesinde anonim **Kâşif** profiliyle alındı. Uygulama ekranına yalnızca dışarıdan mağaza başlığı eklendi; arayüz ve görünen Plus kilitleri korundu. Video yok.

| Alt klasör                                       | Boyut       | Dosya sayısı |
| ------------------------------------------------ | ----------- | ------------ |
| `ios-6.9/tr/`, `ios-6.9/en/`                     | 1320 × 2868 | 5 + 5        |
| `ios-6.5/tr/`, `ios-6.5/en/`                     | 1284 × 2778 | 5 + 5        |
| `ipad-13/tr/`, `ipad-13/en/`                     | 2064 × 2752 | 5 + 5        |
| `play-phone/tr/`, `play-phone/en/`               | 1080 × 2400 | 5 + 5        |
| `play-phone-upload/tr/`, `play-phone-upload/en/` | 1080 × 1920 | 5 + 5        |

**Google Play yüklemesinde `play-phone-upload/` setini kullanın.** İstenen 1080 × 2400 ayrıca teslim edildi; [Google Play](https://support.google.com/googleplay/android-developer/answer/9866151?hl=en) uzun kenarı kısa kenarın en fazla iki katı olan ekran görüntülerini kabul eder. 1080 × 1920 seti önerilen 9:16 oranını da sağlar. [Apple boyutları](https://developer.apple.com/help/app-store-connect/reference/app-information/screenshot-specifications/) ayrı ayrı karşılanır.

Aşağıdaki dosyaların her biri, yukarıdaki on dil/boyut klasöründe bulunur. Rota kaynağı: [Router.tsx](../../src/app/Router.tsx).

| Dosya            | Sahne                                                                                           | Rota                                                               |
| ---------------- | ----------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| `01-dunya.png`   | Başlangıç Bahçesi ve öğrenme yolu. İlerleme kilitleri ve görünür Plus kilitleri arayüzde kalır. | `/world/w1`                                                        |
| `02-ders.png`    | İlk Evcil Hayvanlar dersinde resimli İngilizce kelime kartı.                                    | `/lesson/w1_u1_l1`                                                 |
| `03-konusma.png` | Nova ile Konuş, Evcil Hayvan Dükkanı senaryosunun ilk diyaloğu.                                 | `/conversation?worldId=w1&scenarioId=phase1_animals_pet_shop_pick` |
| `04-hikaye.png`  | Nova Visits the Farm, resimli ilk sayfa.                                                        | `/stories/story-w1-farm-visit`                                     |
| `05-ebeveyn.png` | Ücretsiz haftalık ebeveyn özeti. Ayrıntılı raporun Plus kilidi görünür.                         | `/parent`                                                          |

Diğer dosyalar: `play-feature-graphic/tr.png` ve `play-feature-graphic/en.png` (1024 × 500, Nova, uygulama adı ve tek satır slogan); `play-icon-512.png` (512 × 512, [repo ikonu](../../public/icon-512x512.png) piksel değerleri korunarak RGBA dışa aktarım); `README.md` (dosyalar, rotalar ve kullanım notları).

Çekimler cihaz boyutlarına göre tarayıcıda yapıldı. Ders rotası geliştirme modunda “Maximum update depth exceeded” hatası verdi; ders görselleri aynı kodun web yayın derlemesindeki gerçek rotadan alındı. EN setinde uygulamanın dil seçimi İngilizcedir; kaynakta Türkçe sabit kalan sahne etiketleri ve süre/sayfa göstergeleri arayüzde olduğu gibi durur. Mağaza önizlemesinde her cihaz sınıfının ve dilin sırasını kontrol edin.
