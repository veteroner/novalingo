# NovaLingo öğrenme yolu

21 Ekim 2026. Kullanıcının Duolingo ekran görüntüsündeki öğrenme yolunu NovaLingo'nun mevcut müfredatına uyarlayan değişiklik.

## Davranış

12 dünya, ünite başlıklarıyla bölünmüş kıvrımlı bir yol kullanır. Dersler dokunulabilir kabartmalı taşlardır; üç yıldız, tamamlanan, sıradaki ve kilitli durumlar birbirinden ayrılır. Başlık uzun ünitelerde görünür kalır. Nova yol kenarında durur; sürekli hareket yoktur.

Bir taşa dokunmak ders bilgisini açar. Süre ve XP gerçek ders kaydından gelir. Açık derste “Derse başla”, tamamlananda “Tekrar et”, kilitlide açıklama ve devre dışı başlatma görünür. Escape veya kapatma düğmesi kartı kapatır; odak taşa döner. “Kaldığım yere git” sıradaki derse kaydırır ve kartını açar. Sistem hareketi azalt tercihi kaydırmada da desteklenir.

Ünite rehberi müfredattaki kelimeleri, hedef cümle kalıplarını ve öğrenme hedefini gösterir. Yeni öğrenme içeriği veya tercüme uydurulmaz. Her üç derste bir var olan konuşma pratiği durağı korunur. Konuşma durağı ancak kendisinden önceki derslerin tümü başarıyla tamamlandığında açılır.

Dünya seçicisi 12 dünyayı gösterir; ileriki dünyalar mevcut dünya tamamlanana kadar kilitlidir. Mevcut Plus ve günlük ücretsiz ders sınırları başlatma akışında korunur. Masaüstünde gerçek seri/elmas verileri, günlük ders sayısı, görevler ve kelime tekrarına bağlantılar yer alır. Mobilde yol tek sütundur. Açık/koyu tema ve Türkçe/İngilizce desteklenir.

## İlerleme düzeltmesi

Eski harita, bir ilerleme kaydının varlığını tamamlanma sayıyordu. Sıfır yıldızlı denemeler artık tamamlanma olarak gösterilmez; sunucudaki dünya ilerleme kuralıyla aynı şekilde en az bir yıldız gerekir. Dersler önce müfredatın dünya/ünite/derse ait sırasına dizilir; uzaktaki yeni ders ve üniteler de görünür kalır. Geçmiş ilerleme kayıtları değiştirilmez.

## Kaynak ve kapsam

Girdi: kullanıcının paylaştığı Duolingo ekran görüntüsü. Genel yol, ünite rehberi ve tekrar yaklaşımı için [Duolingo'nun resmî açıklaması](https://blog.duolingo.com/new-duolingo-home-screen-design/) incelendi. Duolingo kaynak kodu, özel API'si veya görsel varlıkları kullanılmadı. Uygulama mevcut React/CSS bileşenleri, Phosphor ikonları ve Nova varlıklarıyla yazıldı. Yeni algoritmik kişiselleştirme, enerji/can sistemi, ödül ekonomisi veya sunucu servisi eklenmedi.

## Doğrulama

- 4.906 test / 52 dosya başarılı. Haritaya ilişkin 28 test: 12 dünyanın tüm derslerini koruma, karışık uzak veriyi sıralama, sıfır yıldızlı deneme, konuşma kilitleri, ders tekrarı, rehber ve Plus/günlük limit yönlendirmeleri.
- TypeScript, sıfır uyarı lint ve üretim derlemesi başarılı. Önceden var olan büyük JS parçaları uyarısı sürer.
- Tarayıcıda 320 ve 393 piksel mobil, 1280 piksel masaüstü; açık/koyu tema, TR/EN, ders kartı, rehber ve dünya seçicisi kontrol edildi. Mobilde yatay taşma/eksik görsel yok.
- Önizleme örnek çocuk verisi kullanır; oturum açmaz ve sunucuya yazmaz. Gerçek cihazda mikrofon/satın alma uçtan uca testi bu arayüz değişikliğinin parçası değildir.

## Yerel önizleme

`http://127.0.0.1:3002/visual-preview.html?view=world/w1`

Başka dünya: `?view=world/w6&world=w6`. İlerleme: `progress=new` / `progress=started` / `progress=complete`. Fixture üretim paketine dahil edilmez.

## Ekran görüntüleri

- [Mobil ders yolu ve ders kartı](screenshots/nova-world-path-mobile.png)
- [Masaüstü ders yolu](screenshots/nova-world-path-desktop.png)
- [320 piksel koyu tema ve İngilizce rehber](screenshots/nova-world-guide-dark.png)
