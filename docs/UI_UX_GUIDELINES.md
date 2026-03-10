# NovaLingo — UI/UX Tasarım Sistemi

> Çocuk dostu tasarım prensipleri, renk paleti, tipografi, bileşen rehberi
> Son güncelleme: 28 Şubat 2026

---

## 1. Tasarım Felsefesi

### Temel İlkeler
1. **Çocuk-Merkezli:** Her etkileşim 4 yaşındaki bir çocuğun anlayacağı kadar basit
2. **Keşif Odaklı:** Merak uyandıran, dokunulası, interaktif yüzeyler
3. **Başarısızlık-Güvenli:** Yanlış cevap = öğrenme fırsatı, korkutucu değil
4. **Renk = Anlam:** Tutarlı renk kodlaması — yeşil=doğru, kırmızı=yanlış, mavi=aksiyon
5. **Ses + Görsel Senkron:** Her dokunuş + aksiyon = ses + görsel geribildirim

---

## 2. Renk Paleti

### 2.1 Ana Renkler (Primary)

```css
:root {
  /* Primary — Ana marka rengi */
  --primary-50: #E8F5FE;
  --primary-100: #B8E2FC;
  --primary-200: #88CFF9;
  --primary-300: #58BCF7;
  --primary-400: #28A9F5;
  --primary-500: #0D8FDB;   /* ← ANA RENK: Canlı mavi */
  --primary-600: #0A72AF;
  --primary-700: #075583;
  --primary-800: #053857;
  --primary-900: #021B2B;

  /* Secondary — Tamamlayıcı */
  --secondary-50: #FFF3E0;
  --secondary-100: #FFE0B2;
  --secondary-200: #FFCC80;
  --secondary-300: #FFB74D;
  --secondary-400: #FFA726;
  --secondary-500: #FF9800;  /* ← Sıcak turuncu */
  --secondary-600: #FB8C00;
  --secondary-700: #F57C00;
  --secondary-800: #EF6C00;
  --secondary-900: #E65100;
}
```

### 2.2 Semantik Renkler

```css
:root {
  /* Başarı */
  --success-light: #E8F5E9;
  --success-main: #4CAF50;   /* Yeşil — Doğru cevap, tamamlama */
  --success-dark: #2E7D32;

  /* Hata */
  --error-light: #FFEBEE;
  --error-main: #F44336;     /* Kırmızı — Yanlış cevap (nazik ton) */
  --error-dark: #C62828;

  /* Uyarı */
  --warning-light: #FFF8E1;
  --warning-main: #FFC107;   /* Sarı — Dikkat, ipucu */
  --warning-dark: #F9A825;

  /* Bilgi */
  --info-light: #E3F2FD;
  --info-main: #2196F3;
  --info-dark: #1565C0;
}
```

### 2.3 Yaş Grubu Temaları

```
Cubs (4-6):
  ┌──────────────────────────────────────────┐
  │ Soft pastels, büyük formlar, yuvarlak    │
  │ BG: #FFF9F0 (warm cream)                 │
  │ Accent: #FF6B6B (soft coral)             │
  │ Border radius: 24px (çok yuvarlak)       │
  │ Shadows: Büyük, yumuşak (8px blur)       │
  └──────────────────────────────────────────┘

Stars (7-9):
  ┌──────────────────────────────────────────┐
  │ Canlı renkler, dinamik, eğlenceli        │
  │ BG: #F0F7FF (cool light blue)            │
  │ Accent: #FF9800 (energetic orange)       │
  │ Border radius: 16px (yuvarlak)           │
  │ Shadows: Orta, renkli aksan              │
  └──────────────────────────────────────────┘

Legends (10-12):
  ┌──────────────────────────────────────────┐
  │ Daha olgun, kontrast, "cool" hissiyat    │
  │ BG: #F5F5F7 (moderne gri)               │
  │ Accent: #7C4DFF (modern purple)          │
  │ Border radius: 12px (hafif yuvarlak)     │
  │ Shadows: Keskin, modern                  │
  └──────────────────────────────────────────┘
```

### 2.4 Karanlık Mod

```typescript
// Çocuklar için karanlık mod = "Gece Modu"
// Ebeveyn panelinden aktifleştirilebilir
// Yatmadan önce göz yorgunluğunu azaltır

const darkPalette = {
  background: '#1A1A2E',       // Koyu lacivert (siyah değil!)
  surface: '#16213E',
  surfaceVariant: '#0F3460',
  textPrimary: '#E8E8E8',
  textSecondary: '#A0A0B0',
  primary: '#4FC3F7',           // Daha soft mavi
  accent: '#FFB74D',            // Daha soft turuncu
  // Neon parlamalar efektleri eklenir (çocuklara çekici)
};
```

---

## 3. Tipografi

### 3.1 Font Ailesi

```css
:root {
  /* Ana metin — Yüksek okunabilirlik, çocuk dostu */
  --font-primary: 'Nunito', 'Quicksand', system-ui, sans-serif;
  
  /* Başlıklar — Eğlenceli, dikkat çekici */
  --font-heading: 'Baloo 2', 'Nunito', sans-serif;
  
  /* Sayılar / XP / Puan — Monospace, oyun hissi */
  --font-mono: 'Fredoka One', 'Nunito', sans-serif;
}
```

### 3.2 Boyut Skalası

```css
:root {
  /* Yaş grubuna göre ayarlanan taban boyut */
  --text-base-cubs: 18px;        /* 4-6 yaş: BÜYÜK */
  --text-base-stars: 16px;       /* 7-9 yaş: Normal */
  --text-base-legends: 15px;     /* 10-12 yaş: Kompakt */

  /* Skalası (rem → taban boyuta göre hesaplanır) */
  --text-xs: 0.75rem;     /* 12px / 13.5px / 11.25px */
  --text-sm: 0.875rem;    /* 14px / 15.75px / 13.125px */
  --text-base: 1rem;      /* 16px / 18px / 15px */
  --text-lg: 1.125rem;    /* 18px / 20.25px / 16.875px */
  --text-xl: 1.25rem;     /* 20px / 22.5px / 18.75px */
  --text-2xl: 1.5rem;     /* 24px / 27px / 22.5px */
  --text-3xl: 2rem;       /* 32px / 36px / 30px */
  --text-4xl: 2.5rem;     /* 40px / 45px / 37.5px */
  
  /* Satır yüksekliği */
  --leading-tight: 1.25;
  --leading-normal: 1.5;
  --leading-relaxed: 1.75;    /* Çocuklar için daha geniş */
}
```

### 3.3 Font Ağırlıkları

| Kullanım | Weight | Örnek |
|----------|--------|-------|
| Gövde metni | 400 (Regular) | Açıklamalar, hikaye |
| UI etiketleri | 600 (SemiBold) | Butonlar, tab'lar |
| Başlıklar | 700 (Bold) | Ders adları, sayfa başlıkları |
| Vurgulu sayılar | 800 (ExtraBold) | XP, skor, seviye |
| Display | 900 (Black) | "TEBRIKLER!", "LEVEL UP!" |

---

## 4. Boşluk (Spacing) Sistemi

### 4.1 Spacing Skalası

```css
:root {
  --space-0: 0;
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;
  --space-5: 20px;
  --space-6: 24px;
  --space-8: 32px;
  --space-10: 40px;
  --space-12: 48px;
  --space-16: 64px;
  --space-20: 80px;
}
```

### 4.2 Safe Areas

```css
/* Mobile safe areas */
.app-container {
  padding-top: env(safe-area-inset-top, 20px);
  padding-bottom: env(safe-area-inset-bottom, 34px);
  padding-left: env(safe-area-inset-left, 0);
  padding-right: env(safe-area-inset-right, 0);
}

/* iOS notch + dynamic island desteği */
/* Android gesture bar desteği */
```

---

## 5. Dokunma Hedefleri (Touch Targets)

### 5.1 Minimum Boyutlar

```
┌──────────────────────────────────────────────────────┐
│ ZORUNLU: Tüm dokunulabilir alanlar                   │
│                                                       │
│ Cubs (4-6):  minimum 56×56px (büyük parmaklar!)      │
│ Stars (7-9): minimum 48×48px                          │
│ Legends (10-12): minimum 44×44px (Apple HIG standardı)│
│                                                       │
│ Parent Panel: minimum 44×44px (yetişkin standardı)    │
│                                                       │
│ Dokunma alanları arası minimum mesafe: 8px            │
└──────────────────────────────────────────────────────┘
```

### 5.2 Dokunma Geribildirimi

```typescript
const touchFeedback = {
  // Her dokunuşta haptic feedback
  haptic: {
    button: 'light',         // Hafif titreşim
    correct: 'success',      // Başarılı titreşim
    wrong: 'warning',        // Uyarı titreşim
    achievement: 'heavy',    // Güçlü titreşim
  },
  
  // Görsel feedback
  visual: {
    scale: 0.95,              // Basıldığında hafif küçülme
    duration: 100,            // ms
    backgroundColor: 'darken(10%)', // Hafif karartma
  },
  
  // Ses feedback
  audio: {
    tap: 'sfx_tap.mp3',
    correct: 'sfx_correct.mp3',
    wrong: 'sfx_wrong.mp3',
    complete: 'sfx_complete.mp3',
  },
};
```

---

## 6. Bileşen Tasarım Sistemi

### 6.1 Butonlar

```
┌─────────────────────────────────────────────────────┐
│  PRIMARY BUTTON (Ana aksiyon)                       │
│                                                      │
│  ╭──────────────────────────────╮                   │
│  │     🎮  Derse Başla!         │ ← 56px yükseklik │
│  ╰──────────────────────────────╯   border-radius: 28px
│                                      shadow: 0 4px 0 #0A72AF
│  Renk: primary-500                   3D "basılabilir" efekti
│  Metin: white, bold, 18px            Pressed: translateY(4px) + shadow shrink
│  İkon: Opsiyonel, solda              Disabled: opacity 0.5 + no shadow
│                                                      │
├─────────────────────────────────────────────────────┤
│  SECONDARY BUTTON (İkincil aksiyon)                 │
│                                                      │
│  ╭──────────────────────────────╮                   │
│  │       Tekrar Dene            │ ← 48px yükseklik │
│  ╰──────────────────────────────╯   border: 2px solid primary
│                                      bg: white       │
│  Metin: primary-500, semibold        No 3D shadow    │
├─────────────────────────────────────────────────────┤
│  GHOST BUTTON (Üçüncül)                            │
│                                                      │
│  ╭──────────────────────────────╮                   │
│  │       Atla →                 │ ← 44px yükseklik │
│  ╰──────────────────────────────╯   border: none    │
│                                      bg: transparent │
│  Metin: gray-500, regular            hover: bg gray-50│
└─────────────────────────────────────────────────────┘
```

### 6.2 Kartlar

```
╭─────────────────────────────────────────╮
│  📸 İmaj/İkon Alanı                     │  Üst kısım: Görsel
│  (4:3 oran, rounded-top)                │  çocuklar için görsel öncelikli
├─────────────────────────────────────────┤
│  🏷️ Başlık                              │  Alt kısım: Metin
│  Açıklama metni (max 2 satır)           │  overflow: hidden
│  ⭐ 30 XP   ⏱️ 5dk                      │  Meta bilgi
╰─────────────────────────────────────────╯

Card Variants:
  - LessonCard: Ders kartı (progress bar alt kısımda)
  - WordCard: Kelime kartı (flip animasyonu ile iki yüzlü)
  - AchievementCard: Başarım kartı (parıltı efekti)
  - QuestCard: Görev kartı (progress indicator)
  - RewardCard: Ödül kartı (glow efekti)

Stil:
  background: white
  border-radius: 20px (cubs), 16px (stars), 12px (legends)
  shadow: 0 4px 12px rgba(0,0,0,0.08)
  hover/press: translateY(-2px), shadow artışı
```

### 6.3 Progress Barlar

```
Linear Progress:
  ╭──────────────────────────────────────╮
  │ ████████████░░░░░░░░░░░░░░░░░░  40% │
  ╰──────────────────────────────────────╯
  
  Height: 12px (cubs), 10px (stars), 8px (legends)
  Border-radius: full (pill shape)
  Background: gray-200
  Fill: gradient (primary-400 → primary-600) + shimmer animasyonu
  Transition: width 0.5s ease-out (animasyonlu ilerleme)

Circular Progress:
  ╭────╮
  │ 75% │   XP/Level progress için
  ╰────╯   Stroke: 4px, animasyonlu
  
XP Bar (Special):
  ╭──────────────────────────────────────╮
  │ ████████████████░░░░░░░░░░░░  Level 5│
  │ 680/1000 XP                          │
  ╰──────────────────────────────────────╯
  Fill color changes with level range (rainbow güzel görünür)
```

### 6.4 Diyaloglar & Modallar

```
╭───────────────────────────────────╮
│           ⭐                       │ ← İkon/Emoji (büyük, 48-64px)
│                                    │
│    Dersi Tamamladın!              │ ← Başlık (text-2xl, bold)
│                                    │
│    50 XP kazandın ve             │ ← Açıklama (text-base)
│    3 yeni kelime öğrendin!        │
│                                    │
│  ╭──────────────────────────────╮ │
│  │       Harika! 🎉            │ │ ← Primary CTA
│  ╰──────────────────────────────╯ │
│         Dersi Tekrarla            │ ← Secondary link (text-only)
╰───────────────────────────────────╯

Stil:
  Overlay: rgba(0,0,0,0.4), backdrop-blur: 8px
  Modal: bg-white, border-radius: 24px, max-width: 340px
  Giriş animasyonu: scale(0.8→1) + fade, spring easing
  Çıkış: scale(1→0.8) + fade, 200ms
  
  ÖNEMLİ: Modalda "X" kapatma butonu YOK (çocuklar yanlışlıkla kapatmasın)
  Kapama: Sadece CTA butonu ile
```

### 6.5 Navigation

```
Bottom Tab Bar (Ana navigasyon):
  ╭───────────────────────────────────────────────────╮
  │  🏠        📚         🎮         🏆         👤    │
  │  Ana     Dersler    Oyunlar   Sıralama    Profil │
  ╰───────────────────────────────────────────────────╯
  
  Aktif: primary renk + bold + hafif bounce animasyon
  Pasif: gray-400
  Badge: Bildirim sayısı (kırmızı dairesel badge)
  Height: 64px (cubs/stars), 56px (legends)
  Safe area: Altta cihaz safe-area eklenir
  
  TAB DEĞİŞİM ANİMASYONU:
  - İkon scale: 1 → 1.2 → 1 (bounce)
  - Lottie micro-animation (her tab için unique)
```

---

## 7. Animasyon Rehberi

### 7.1 Animasyon Prensipleri

| Prensip | Kural |
|---------|-------|
| Süre | Mikro: 100-200ms, Normal: 200-400ms, Vurgulu: 400-800ms |
| Easing | spring(1, 80, 10) tercih edilir (doğal his) |
| Amaç | Her animasyonun bir sebebi olmalı (feedback, dikkat, kutlama) |
| Performance | 60fps zorunlu, yalnızca transform + opacity kullan |
| Erişilebilirlik | `prefers-reduced-motion` destekle |

### 7.2 Animasyon Kataloğu

```typescript
const ANIMATIONS = {
  // Geçişler
  pageEnter: { duration: 300, type: 'spring', stiffness: 300 },
  pageExit: { duration: 200, ease: 'easeIn' },
  
  // Buton
  buttonPress: { scale: 0.95, duration: 100 },
  buttonRelease: { scale: 1, type: 'spring' },
  
  // Kartlar
  cardFlip: { rotateY: 180, duration: 600, ease: 'easeInOut' },
  cardHover: { y: -4, shadow: 'lg', duration: 200 },
  
  // Doğru/Yanlış
  correctAnswer: {
    sequence: [
      { scale: 1.1, duration: 100 },
      { scale: 1, borderColor: 'green', backgroundColor: 'green-50', duration: 200 },
      { confetti: true },
    ],
  },
  wrongAnswer: {
    sequence: [
      { x: [-8, 8, -8, 8, 0], duration: 400 },  // Shake
      { borderColor: 'red', backgroundColor: 'red-50', duration: 200 },
    ],
  },
  
  // XP
  xpGain: {
    // XP sayısı dokunmatik alanından yukarı süzülür
    initial: { y: 0, opacity: 1, scale: 0.5 },
    animate: { y: -60, opacity: 0, scale: 1.5, duration: 1000 },
  },
  
  // Nova
  novaIdle: { type: 'lottie', loop: true },
  novaHappy: { type: 'lottie', loop: false },
  novaSad: { type: 'lottie', loop: false },
  novaDance: { type: 'lottie', loop: true, duration: 3000 },
  
  // Kutlama
  celebration: {
    confetti: { count: 50, spread: 120, gravity: 0.8 },
    stars: { count: 20, size: [10, 20] },
    fireworks: { count: 3, delay: 200 },
  },
};
```

### 7.3 Lottie Animasyon Listesi

| Animasyon | Dosya | Kullanım | Loop |
|-----------|-------|----------|------|
| nova-idle | nova-idle.json | Ana ekran | ✅ |
| nova-happy | nova-happy.json | Doğru cevap | ❌ |
| nova-sad | nova-sad.json | Yanlış cevap | ❌ |
| nova-dance | nova-dance.json | Ders tamamlama | ❌ |
| nova-sleep | nova-sleep.json | Uyku zamanı | ✅ |
| nova-egg | nova-egg.json | Yumurta sallanma | ✅ |
| nova-evolution | nova-evolve.json | Evrim | ❌ |
| confetti | confetti.json | Kutlama | ❌ |
| stars-burst | stars-burst.json | Yıldız patlaması | ❌ |
| level-up | level-up.json | Seviye atlama | ❌ |
| streak-fire | streak-fire.json | Seri alevi | ✅ |
| reward-chest | reward-chest.json | Ödül sandığı | ❌ |
| spinner-wheel | spinner.json | Çark çevirme | ❌ |
| loading | loading-nova.json | Yükleme | ✅ |

---

## 8. İkonografi

### 8.1 İkon Sistemi

```
icon kütüphanesi: Phosphor Icons (playground-friendly weight)
İkon boyutları:
  - xs: 16px (badges, meta info)
  - sm: 20px (inline, liste items)
  - md: 24px (standart UI)
  - lg: 32px (vurgulu)
  - xl: 48px (modal ikon, navigation)
  
İkon stili: "Bold" weight (çocuklar için daha görünür)
Renk: Bağlama göre (gray-500 pasif, primary aktif, semantic renkler)
```

### 8.2 Custom İkonlar (SVG)

| İkon | Kullanım |
|------|----------|
| ⭐ Yıldız | Soft currency, derecelendirme |
| 💎 Elmas | Hard currency |
| 🔥 Alev | Streak animation |
| ❤️ Can | Ders sırasında hak |
| 💡 Ampul | İpucu |
| 🎯 Hedef | Görev |
| 🏆 Kupa | Liderlik |
| 🎁 Hediye | Ödül |
| 🔒 Kilit | Kilitli içerik |
| ✨ Işıltı | Premium/Yeni |

---

## 9. Ses Tasarımı (Sound Design)

### 9.1 Ses Kategorileri

```typescript
const SOUND_SYSTEM = {
  // UI Sesleri (kısa, subtle)
  ui: {
    tap: { file: 'tap.mp3', volume: 0.3, duration: '50ms' },
    swipe: { file: 'swipe.mp3', volume: 0.2, duration: '100ms' },
    toggle: { file: 'toggle.mp3', volume: 0.3, duration: '80ms' },
    back: { file: 'back.mp3', volume: 0.2, duration: '100ms' },
    popup: { file: 'popup.mp3', volume: 0.3, duration: '200ms' },
  },
  
  // Oyun Sesleri
  game: {
    correct: { file: 'correct.mp3', volume: 0.5, duration: '300ms' },
    wrong: { file: 'wrong.mp3', volume: 0.4, duration: '400ms' },
    combo: { file: 'combo.mp3', volume: 0.6, duration: '500ms' },
    streak: { file: 'streak.mp3', volume: 0.5, duration: '600ms' },
    timeUp: { file: 'time-up.mp3', volume: 0.6, duration: '800ms' },
    hint: { file: 'hint.mp3', volume: 0.4, duration: '300ms' },
  },
  
  // Kutlama Sesleri
  celebration: {
    lessonComplete: { file: 'lesson-complete.mp3', volume: 0.6, duration: '2s' },
    levelUp: { file: 'level-up.mp3', volume: 0.7, duration: '3s' },
    achievement: { file: 'achievement.mp3', volume: 0.6, duration: '2s' },
    evolution: { file: 'evolution.mp3', volume: 0.8, duration: '5s' },
    perfect: { file: 'perfect.mp3', volume: 0.7, duration: '2s' },
  },
  
  // Arka Plan Müziği
  bgm: {
    homeScreen: { file: 'bgm-home.mp3', volume: 0.15, loop: true },
    lesson: { file: 'bgm-lesson.mp3', volume: 0.1, loop: true },
    quiz: { file: 'bgm-quiz.mp3', volume: 0.12, loop: true },
    story: { file: 'bgm-story.mp3', volume: 0.1, loop: true },
  },
  
  // Nova Sesleri
  nova: {
    greeting: { file: 'nova-hi.mp3', volume: 0.5 },
    encourage: { file: 'nova-encourage.mp3', volume: 0.5 },
    celebrate: { file: 'nova-yay.mp3', volume: 0.5 },
    hint: { file: 'nova-hint.mp3', volume: 0.5 },
  },
};
```

### 9.2 Ses Kontrolleri

```
Ebeveyn Paneli:
  - Master Volume: 0-100%
  - Müzik: Aç/Kapa
  - Efektler: Aç/Kapa  
  - Nova sesi: Aç/Kapa
  - Sessiz mod (hepsini kapat)
  
Otomatik:
  - Cihaz sessiz modda → Tüm sesler kapalı
  - Kulaklık takılı → Volume sınırı 85%
  - Ekran zamanı limiti yaklaşıyor → Müzik yavaşça solar
```

---

## 10. Responsive Tasarım

### 10.1 Ekran Boyutları

```css
/* Mobile First yaklaşım */
/* Breakpoints */
--screen-sm: 320px;    /* Küçük telefon (iPhone SE) */
--screen-md: 375px;    /* Standart telefon (iPhone 14) */
--screen-lg: 414px;    /* Büyük telefon (iPhone 14 Plus) */
--screen-xl: 768px;    /* Tablet portrait */
--screen-2xl: 1024px;  /* Tablet landscape */

/* Tasarım Genel Kuralları */
/* Telefon: Dikey (portrait) optimize */
/* Tablet: Yatay (landscape) da desteklenir */
/* Minimum genişlik: 320px */
/* Maksimum içerik genişliği: 480px (phone), 720px (tablet) */
```

### 10.2 Layout Stratejisi

```
Telefon (Portrait):
  ┌──────────────────┐
  │     Header       │  ← Fixed top
  │                  │
  │                  │
  │    Content       │  ← Scrollable
  │    (Full Width)  │
  │                  │
  │                  │
  │   Bottom Nav     │  ← Fixed bottom
  └──────────────────┘

Tablet (Landscape):
  ┌────────────────────────────────┐
  │  Header                        │
  ├──────────┬─────────────────────┤
  │          │                     │
  │  Side    │     Content         │
  │  Nav     │     (Centered)      │
  │          │                     │
  │          │                     │
  └──────────┴─────────────────────┘
```

---

## 11. Erişilebilirlik (Accessibility)

### 11.1 WCAG Uyumluluğu

| Kriter | Hedef | Açıklama |
|--------|-------|----------|
| Renk kontrastı | AA (4.5:1 metin) | Tüm metin-arka plan kombinasyonları |
| Dokunma hedefi | 44×44px minimum | Tüm interaktif elemanlar |
| Metin boyutu | 15px minimum | Okunabilir minimum |
| Animasyon | reduced-motion | Sistem tercihine uyum |
| Alt text | Tüm görseller | Açıklayıcı img alt |
| Focus indicator | Görünür | Klavye navigasyonu |
| Screen reader | VoiceOver/TalkBack | Semantic HTML + ARIA |

### 11.2 Renk Körlüğü Desteği

```
Doğru/Yanlış geribildirimi SADECE renge bağlı olmamalı:
  ✅ Doğru: Yeşil renk + ✓ simgesi + "Doğru!" metni + ses
  ❌ Yanlış: Kırmızı renk + ✗ simgesi + shake animasyonu + ses
  
İkonlar + Renkler her zaman birlikte kullanılır
```

### 11.3 Reduced Motion Desteği

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
  
  /* Önemli geçişler basit fade ile değiştirilir */
  .page-transition {
    opacity: 0;
    transition: opacity 200ms ease;
  }
}
```

---

## 12. Loading & Empty States

### 12.1 Loading States

```
Skeleton Loading (tercih):
  ╭──────────────────────────────╮
  │  ░░░░░░░░░░░░░░             │ ← Animasyonlu shimmer
  │  ░░░░░░░░░░░░░░░░░░░░       │
  │  ░░░░░░░░░░░░               │
  ╰──────────────────────────────╯
  
Nova Loading (app başlangıcı):
  Nova idle Lottie animasyonu + "Hazırlanıyor..." yazısı
  
Activity Loading:
  Progress spinner + "Ders yükleniyor..." + ipucu tip
```

### 12.2 Empty States

```
Tamamlanan görev yok:
  ╭──────────────────────────────╮
  │        (Nova confused)        │
  │                               │
  │   Henüz görevin yok!         │
  │   Bir derse başlayarak       │
  │   görev kazan 🎯             │
  │                               │
  │  ╭─────────────────────────╮ │
  │  │     Derse Başla!        │ │
  │  ╰─────────────────────────╯ │
  ╰──────────────────────────────╯
  
Her empty state:
  - Nova'nın uygun ifadesi (Lottie)
  - Açıklayıcı metin
  - Aksiyon butonu (her zaman bir çıkış yolu)
```

---

## 13. Ekran Akış Diyagramları

### 13.1 Ana Akış

```
Splash Screen → Loading → Onboarding → Kayıt → 
    ↓                                      ↓
    Ana Ekran ←──────────────────────── Çocuk Seç
        ↓
    ┌───┴──────────────────────────┐
    │                              │
    ↓         ↓          ↓        ↓
  Dünya  → Aktivite → Sonuç →  Ana Ekran
  Haritası   Ekranı    Ekranı
    │
    ├── Görevler →  Görev Detay
    ├── Liderlik →  Liga Detay
    ├── Profil   →  Koleksiyon / Ayarlar
    └── Mağaza   →  Satın Alma
```

### 13.2 Ebeveyn Paneli Akışı 

```
Ebeveyn Gate (PIN/Parental Gate) → 
    ↓
  Dashboard
    ├── Çocuk İlerleme Detayı
    ├── Kelime Raporu 
    ├── Ekran Zamanı Ayarları
    ├── İçerik Filtreleme
    ├── Bildirim Tercihleri
    ├── Abonelik Yönetimi
    └── Hesap Ayarları
```

---

## 14. Parental Gate Tasarımı

### 14.1 Mekanik

```
Parental Gate gerekli yerler:
  - Ebeveyn paneline giriş
  - Uygulama içi satın alma
  - Harici linklere yönlendirme
  - Abonelik değişikliği
  - Hesap silme

Gate Türleri:
  1. Math Gate: "7 × 4 = ?" (basit çarpma, çocuk çözemez)
  2. Slide Gate: "Kaydırarak doğrula" (karmaşık gesture)
  3. PIN: 4-6 haneli (ebeveyn belirler)
  
  Default: Math Gate (kayıt gerektirmez)
  Tercih: PIN (ebeveyn ayarlarsa)
```

---

## 15. Tasarım Token'ları (Tailwind Config)

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss';

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5FE',
          100: '#B8E2FC',
          200: '#88CFF9',
          300: '#58BCF7',
          400: '#28A9F5',
          500: '#0D8FDB',
          600: '#0A72AF',
          700: '#075583',
          800: '#053857',
          900: '#021B2B',
        },
        secondary: {
          50: '#FFF3E0',
          100: '#FFE0B2',
          200: '#FFCC80',
          300: '#FFB74D',
          400: '#FFA726',
          500: '#FF9800',
          600: '#FB8C00',
          700: '#F57C00',
          800: '#EF6C00',
          900: '#E65100',
        },
        success: { light: '#E8F5E9', DEFAULT: '#4CAF50', dark: '#2E7D32' },
        error: { light: '#FFEBEE', DEFAULT: '#F44336', dark: '#C62828' },
        warning: { light: '#FFF8E1', DEFAULT: '#FFC107', dark: '#F9A825' },
      },
      fontFamily: {
        sans: ['Nunito', 'Quicksand', 'system-ui', 'sans-serif'],
        heading: ['Baloo 2', 'Nunito', 'sans-serif'],
        mono: ['Fredoka One', 'Nunito', 'sans-serif'],
      },
      borderRadius: {
        'cubs': '24px',
        'stars': '16px',
        'legends': '12px',
      },
      spacing: {
        'safe-top': 'env(safe-area-inset-top, 20px)',
        'safe-bottom': 'env(safe-area-inset-bottom, 34px)',
      },
      keyframes: {
        'bounce-in': {
          '0%': { transform: 'scale(0)', opacity: '0' },
          '50%': { transform: 'scale(1.1)' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '25%': { transform: 'translateX(-8px)' },
          '75%': { transform: 'translateX(8px)' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        'shimmer': {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' },
        },
        'glow-pulse': {
          '0%, 100%': { boxShadow: '0 0 5px rgba(13, 143, 219, 0.5)' },
          '50%': { boxShadow: '0 0 20px rgba(13, 143, 219, 0.8)' },
        },
      },
      animation: {
        'bounce-in': 'bounce-in 0.4s ease-out',
        'shake': 'shake 0.4s ease-in-out',
        'float': 'float 3s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'glow-pulse': 'glow-pulse 2s ease-in-out infinite',
      },
    },
  },
  plugins: [],
} satisfies Config;
```
