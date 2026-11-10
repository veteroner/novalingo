# Eski Google Play alıcıları için destek

> **İletişim tutarsızlığı:** [Web hesap silme sayfası](https://novalingo.teknovagroup.com/legal/delete-account) `privacy@novalingo.app`, [yayımdaki gizlilik politikası](https://teknovagroup.com/novalingo-gizlilik-politikasi) ise görev notuna göre `bilgi@teknovagroup.com` diyor. Eski alıcı desteği: **bilgi@teknovagroup.com**. Yasal sayfalar bu paket kapsamında değiştirilmedi. **DOĞRULANMALI:** Yayımdaki iki adresi ve her iki gelen kutusunun çalıştığını kontrol edin.

> **Karar (2026-11-10):** Eski alıcıya 90 günlük Plus promosyon kodu verilir; isteyen alıcıya ayrıca Order management'tan 139 TL iade edilir (kodu kullanmış olsa bile). [Play abonelik promosyon kodları](https://support.google.com/googleplay/android-developer/answer/6321495?hl=en) en çok 90 gün verir. Kodlar, Play'de abonelik ürünü açıldıktan sonra Monetize → Promosyon kodları'ndan oluşturulur. **DOĞRULANMALI:** İlk e-postayı göndermeden önce iç test kanalındaki sürümde bir kodu kullanıp Play ekranının 90 gün ücretsiz süreyi ve sonraki yenileme ücretini gösterdiğini kontrol edin.

## Kod e-postası — TR

**Konu:** NovaLingo Plus hediye kodunuz

Merhaba [ad],

NovaLingo’yu daha önce Google Play’den satın aldığınız için teşekkür ederiz. NovaLingo artık ücretsiz indiriliyor. Önceki satın alımınız için size 90 gün NovaLingo Plus sunuyoruz.

**Hediye kodunuz: [KOD]**

1. Android cihazınızda doğru Google hesabıyla Google Play’e giriş yapın ve güncel NovaLingo’yu açın.
2. NovaLingo’da **Abonelik → Hediye kodum var** seçeneğine dokunun. Ebeveyn doğrulaması istenirse tamamlayın.
3. Google Play ekranına kodu girin. Onaylamadan önce 90 günlük ücretsiz süreyi, sonraki yenileme tarihini ve Google Play’de gösterilen ücreti kontrol edin. Ücretsiz süre görünmüyorsa işlemi onaylamadan bize yazın.
4. NovaLingo’ya dönün. Plus görünmezse Abonelik ekranındaki **Satın alma geçmişini geri yükle** seçeneğini deneyin.

**90 günlük ücretsiz süre bitmeden iptal etmezseniz aboneliğiniz ücretli olarak otomatik yenilenir.** İptal etmek için Google Play → Profil simgesi → Ödemeler ve abonelikler → Abonelikler → NovaLingo → Aboneliği iptal et yolunu izleyin.

Ayrıca önceki satın alımınızın ücretini (139 TL) geri almak isterseniz bu e-postayı yanıtlamanız yeterli; kodu kullanmış olsanız da iadenizi Google Play sipariş numaranız üzerinden yaparız.

NovaLingo Destek · bilgi@teknovagroup.com

## Code email — EN

**Subject:** Your NovaLingo Plus gift code

Hi [name],

Thank you for buying NovaLingo on Google Play. NovaLingo is now free to download. As a previous buyer, you’re eligible for 90 days of NovaLingo Plus.

**Your gift code: [CODE]**

1. On your Android device, sign in to the correct Google account in Google Play and open the latest version of NovaLingo.
2. In NovaLingo, go to **Subscription → I have a gift code**. Complete the parental check if prompted.
3. Enter the code on Google Play. Before confirming, check that Google Play shows 90 days at no charge, the next renewal date and the price that will apply. If the free period isn’t shown, contact us before confirming.
4. Return to NovaLingo. If Plus doesn’t appear, try **Restore purchase history** on the Subscription screen.

**Your subscription will automatically renew at the price shown by Google Play unless you cancel before the 90-day free period ends.** To cancel, go to Google Play → Profile icon → Payments & subscriptions → Subscriptions → NovaLingo → Cancel subscription.

You can also get a refund for your original purchase (139 TRY): just reply to this email. Even if you’ve redeemed the code, we’ll process the refund using your Google Play order number.

NovaLingo Support · bilgi@teknovagroup.com

## Sipariş numarası isteği — TR

**Konu:** NovaLingo satın alımınızı doğrulayalım

Merhaba [ad], önceki NovaLingo satın alımınızı bulabilmemiz için Google Play makbuzundaki `GPA.…` ile başlayan sipariş numarasını bu e-postayı yanıtlayarak paylaşır mısınız? Numarayı Google Play’in makbuz e-postasında veya Google Play sipariş geçmişinde bulabilirsiniz. Yalnızca sipariş numarası yeterli; şifrenizi, kart bilgilerinizi veya çocuğunuza ait bilgileri göndermeyin. İade istiyorsanız yanıtınızda belirtin.

NovaLingo Destek · bilgi@teknovagroup.com

## Order number request — EN

**Subject:** Let’s verify your NovaLingo purchase

Hi [name], please reply with the order number beginning with `GPA.…` from your original NovaLingo purchase. You can find it in your Google Play receipt email or Google Play order history. We only need the order number; please don’t send passwords, card details or information about your child. If you’d prefer a refund, please say so in your reply.

NovaLingo Support · bilgi@teknovagroup.com

## Destek ekibi için

- Play Console sipariş yönetiminde `GPA.…` kaydının `com.novalingo.app` için önceki ücretli indirmeye ait olduğunu ve daha önce iade edilmediğini kontrol edin. Aynı sipariş için mükerrer kod göndermeyin.
- İade seçilirse kod vermeden önce sipariş ve iade uygunluğunu doğrulayın; tamamlanmamış iadeyi tamamlanmış gibi bildirmeyin. Hesap silme talebini ayrı akışa yönlendirin.
- Android’de düğmenin Play kod ekranını açtığına ilişkin kaynak: [SubscriptionScreen.tsx](../../src/features/parent/screens/SubscriptionScreen.tsx), [Gift Codes](../MONETIZATION.md#gift-codes-plus-as-a-gift). İki abonelik ürün kimliği: `com.novalingo.app.monthly`, `com.novalingo.app.yearly`.
