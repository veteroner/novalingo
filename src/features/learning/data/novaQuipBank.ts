/**
 * novaQuipBank.ts
 *
 * Nova ve yan karakterler için kısa, tekrar eden replik bankası.
 * Sprint 2 P0: Contextual quip bank providing personality variation across
 * lesson scenes without requiring unique copy for every interaction.
 *
 * Usage:
 *   const quip = getNovaQuip('correct');   // random quip for that context
 *   const quips = getRandomNovaQuips('encouragement', 3);
 */

export type NovaQuipContext =
  | 'lesson-start'
  | 'correct'
  | 'wrong'
  | 'streak'
  | 'perfect'
  | 'boss-intro'
  | 'boss-defeat'
  | 'boss-win'
  | 'encouragement'
  | 'lesson-complete'
  | 'vocab-intro';

export interface NovaQuip {
  /** English text */
  en: string;
  /** Turkish text (shown to child) */
  tr: string;
}

const quipBank: Record<NovaQuipContext, NovaQuip[]> = {
  'lesson-start': [
    { en: "Let's go! You've got this!", tr: 'Hadi başlayalım! Hazır mısın?' },
    { en: "I believe in you! Let's learn!", tr: 'Sana güveniyorum! Öğrenme zamanı!' },
    { en: "Adventure awaits — let's dive in!", tr: 'Macera bekliyor — haydi dalalım!' },
    { en: 'Brain power — activate!', tr: 'Beyin gücü — aktif!' },
    { en: 'Today we learn something awesome!', tr: 'Bugün harika bir şey öğreniyoruz!' },
    { en: 'Ready, set, learn!', tr: 'Hazır, başla, öğren!' },
    { en: 'This lesson is going to be SO fun!', tr: 'Bu ders çok eğlenceli olacak!' },
  ],

  correct: [
    { en: 'Correct! You rock!', tr: 'Doğru! Süpersin!' },
    { en: "That's it! Keep going!", tr: 'İşte bu! Devam et!' },
    { en: 'Nailed it! ⭐', tr: 'Süper! ⭐' },
    { en: "Amazing! You're so smart!", tr: 'Muhteşem! Ne kadar akıllısın!' },
    { en: 'Yes! That was perfect!', tr: 'Evet! Mükemmeldi!' },
    { en: "Boom! You've got it!", tr: 'Boom! Anladın!' },
    { en: 'Wow, fast and correct!', tr: 'Vay be, hızlı ve doğru!' },
    { en: "You're on fire! 🔥", tr: 'Çok iyisin! 🔥' },
    { en: "I knew you'd get it!", tr: 'Bulacağını biliyordum!' },
    { en: "That's exactly right!", tr: 'Kesinlikle doğru!' },
  ],

  wrong: [
    { en: 'Oops! Try again — you can do it!', tr: 'Ups! Tekrar dene — yapabilirsin!' },
    { en: "That's okay! Mistakes help us learn.", tr: 'Olsun! Hatalardan öğreniriz.' },
    { en: 'Not quite — give it another shot!', tr: 'Tam değil — bir daha dene!' },
    { en: 'Almost! Think carefully.', tr: 'Neredeyse! Dikkatlice düşün.' },
    { en: "Good try! Let's try once more.", tr: 'İyi deneme! Bir kez daha deneyelim.' },
    {
      en: "Keep going — you'll get it next time!",
      tr: 'Devam et — bir dahaki sefere doğru yapacaksın!',
    },
    { en: 'Even Nova makes mistakes sometimes!', tr: 'Nova bile bazen hata yapar!' },
  ],

  streak: [
    { en: '🔥 Streak! You are unstoppable!', tr: '🔥 Seri yapıyorsun! Durdurulamıyorsun!' },
    { en: 'Three in a row! Amazing!', tr: 'Arka arkaya üç! İnanılmaz!' },
    { en: "You're on a roll! Keep it up!", tr: 'Harika gidiyorsun! Devam et!' },
    { en: 'Streak power! ⚡', tr: 'Seri gücü! ⚡' },
    { en: "Look at you go! You're a star!", tr: 'Bak nasıl gidiyorsun! Bir yıldızsın!' },
  ],

  perfect: [
    { en: '🌟 PERFECT! Absolutely flawless!', tr: '🌟 MÜKEMMEL! Hatasız!' },
    { en: "100%! You didn't miss a single one!", tr: '%100! Tek hata yapmadın!' },
    {
      en: 'Perfection! Nova is SO proud of you!',
      tr: 'Mükemmellik! Nova seninle çok gurur duyuyor!',
    },
    { en: 'A perfect score — incredible!', tr: 'Tam puan — inanılmaz!' },
    { en: "Zero mistakes! That's a superpower!", tr: 'Sıfır hata! Bu bir süper güç!' },
  ],

  'boss-intro': [
    {
      en: "The Boss is here! Show them what you're made of!",
      tr: 'Patron geldi! Ne kadar güçlü olduğunu göster!',
    },
    { en: 'This is it — Boss Battle time! 🗡️', tr: 'İşte bu an — Patron Savaşı zamanı! 🗡️' },
    {
      en: "A tough challenge awaits. You've trained for this!",
      tr: 'Zorlu bir mücadele seni bekliyor. Bunun için antrenman yaptın!',
    },
    { en: "Don't be afraid — you have all the words!", tr: 'Korkma — tüm kelimelere sahipsin!' },
    { en: "Boss mode: ENGAGED. Let's win this!", tr: 'Patron modu: AKTİF. Kazanalım!' },
  ],

  'boss-defeat': [
    {
      en: 'Everyone loses sometimes. Rest up and try again!',
      tr: 'Herkes bazen kaybeder. Dinlen ve tekrar dene!',
    },
    {
      en: 'The Boss was tough — but so are you. Try again!',
      tr: 'Patron güçlüydü — ama sen de öylesin. Tekrar dene!',
    },
    {
      en: 'A defeat makes the victory even sweeter. You can do it!',
      tr: 'Yenilgi galibiyeti daha da tatlı yapar. Yapabilirsin!',
    },
    {
      en: "Don't give up! The Boss won't know what hit them next time!",
      tr: 'Vazgeçme! Patron bir dahaki sefer şaşıracak!',
    },
  ],

  'boss-win': [
    { en: '👑 BOSS DEFEATED! YOU ARE A CHAMPION!', tr: '👑 PATRON YENİLDİ! SEN BİR ŞAMPİYONSUN!' },
    {
      en: "Incredible! That Boss didn't stand a chance!",
      tr: 'İnanılmaz! O patrontun hiç şansı yoktu!',
    },
    { en: 'VICTORY! All those words paid off! 🏆', tr: 'ZAFer! Tüm o kelimeler işe yaradı! 🏆' },
    { en: 'Legendary! Nova is speechless!', tr: 'Efsanevi! Nova sözlerini yitirdi!' },
    {
      en: 'You crushed the Boss! On to new adventures!',
      tr: 'Patronu ezip geçtin! Yeni maceralara!',
    },
  ],

  encouragement: [
    { en: "You've got this — I know you can!", tr: 'Yapabilirsin — biliyorum!' },
    { en: "Don't stop now, you're doing great!", tr: 'Şimdi durma, harika gidiyorsun!' },
    { en: 'Every try makes you stronger!', tr: 'Her deneme seni güçlendirir!' },
    { en: 'Take a deep breath... and go!', tr: 'Derin bir nefes al... ve devam et!' },
    { en: 'You are braver than you think!', tr: 'Düşündüğünden daha cesaretlisin!' },
    { en: 'Hard words become easy with practice!', tr: 'Zor kelimeler pratikle kolaylaşır!' },
    { en: "I'm cheering for you! 📣", tr: 'Seni destekliyorum! 📣' },
  ],

  'lesson-complete': [
    { en: "Lesson complete! You're a star! ⭐", tr: 'Ders tamamlandı! Sen bir yıldızsın! ⭐' },
    { en: 'You did it! Another lesson down!', tr: 'Başardın! Bir ders daha bitti!' },
    { en: 'Brilliant work! Every lesson counts!', tr: 'Mükemmel iş! Her ders önemli!' },
    { en: 'High five! ✋ You finished the lesson!', tr: 'Çak bir beşlik! ✋ Dersi bitirdin!' },
    { en: 'Well done — your brain levelled up today!', tr: 'Aferin — beynin bugün seviye atladı!' },
    {
      en: 'Another chapter of your adventure is complete!',
      tr: 'Maceranın bir bölümü daha tamamlandı!',
    },
    {
      en: 'Nova is doing a happy dance for you! 🕺',
      tr: 'Nova senin için mutluluk dansı yapıyor! 🕺',
    },
  ],

  'vocab-intro': [
    { en: 'New word alert! Listen carefully!', tr: 'Yeni kelime geliyor! Dikkatlice dinle!' },
    {
      en: 'Ooh, a new word! Can you remember it?',
      tr: 'Oh, yeni bir kelime! Hatırlayabilir misin?',
    },
    {
      en: 'This word is really useful — learn it well!',
      tr: 'Bu kelime çok kullanışlı — iyi öğren!',
    },
    { en: 'Say it with me — out loud!', tr: 'Benimle söyle — yüksek sesle!' },
    {
      en: 'Words are like treasure. Collect them all!',
      tr: 'Kelimeler hazine gibi. Hepsini topla!',
    },
    { en: 'A new word joins your collection! 📚', tr: 'Yeni bir kelime koleksiyonuna katıldı! 📚' },
  ],
};

/**
 * Returns a single random NovaQuip for the given context.
 */
export function getNovaQuip(context: NovaQuipContext): NovaQuip {
  const bank = quipBank[context];
  const idx = Math.floor(Math.random() * bank.length);
  // bank is always non-empty — every context key has at least one entry
  return bank[idx] ?? bank[0] ?? { en: '⭐', tr: '⭐' };
}

/**
 * Returns `count` unique random NovaQuips for the given context.
 * If `count` >= bank size, returns all quips in shuffled order.
 */
export function getRandomNovaQuips(context: NovaQuipContext, count: number): NovaQuip[] {
  const bank: NovaQuip[] = [...quipBank[context]];
  // Fisher-Yates shuffle using explicit typed intermediary
  for (let i = bank.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const a = bank[i] as NovaQuip;
    const b = bank[j] as NovaQuip;
    bank[i] = b;
    bank[j] = a;
  }
  return bank.slice(0, Math.min(count, bank.length));
}

/**
 * Returns all quips for a context (useful for displaying a rotating carousel
 * or pre-loading all variants for a session).
 */
export function getAllNovaQuips(context: NovaQuipContext): NovaQuip[] {
  return [...quipBank[context]];
}
