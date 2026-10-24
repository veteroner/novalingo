# Nova v2 üretim istemleri

> 24 Ekim 2026 güncel durum: [Tamamlananlar ve kalan işler](2026-10-24-visual-completion-audit.md). Bu belge kendi tarihindeki kapsamı/testleri kaydeder; tüm yol haritasının tamamlandığı anlamına gelmez.

Yöntem: yerleşik `image_gen.imagegen`. Karakter kimlik referansı: `nova-v2-direction.png` içindeki büyük soldaki baykuş. Sonraki görsellerin kimlik referansı üretilen nötr Nova kesiti; uygulamada `public/nova/nova-idle.webp`.

Aşağıdaki istem seti üretimde kullanılan sahne ve poz koşullarını kaydeder. Bütün üretimler tek karakter kimliği, aynı indigo/krem/amber/mint paleti, yumuşak mat 3D çizgi film görünümü ve özgün yüz oranlarını korumayı ister. Tüketilen çıktılar WebP olarak kodlanmıştır; kaynak PNG'ler ImageGen çıktılarında korunmuştur.

## Nötr Nova — `public/nova/nova-idle.webp`

Production app cutout asset of ONE Nova owl, same identity as the large left owl in reference, no UI, no text, no rocks, no branch, no scene. Full body centered near-frontal 3/4 view with calm curious expression and large open dark-blue eyes looking at viewer, folded separated wings, two feet at same level, tiny amber talons. Indigo/midnight-blue plumage, ivory paired facial discs and cream chest, short amber curved beak, swept ear tufts and tiny mint wing accents. Simplify feather texture into broad sculpted layers readable at 56px; matte dimensional 3D render. Real transparent alpha, full body visible. No hat, clothes, props, base or background.

## Kutlama — `public/nova/nova-celebrate.webp`

Preserve exact Nova identity, proportions, colors, framing and rendering of neutral reference. Change pose to delighted celebration: wings lifted apart in a shallow V, separated layered feathers, eyes gently closed in a joyful smile, beak slightly open, both feet still on ground and same baseline. Single full-body character, real transparent alpha, no props, no flying.

## Dinleme — `public/nova/nova-listen.webp`

Preserve exact Nova identity, colors, full-body composition and foot baseline. Attentive listening: head tilted slightly to one side, eyes fully open looking a little to viewer left, wings folded neatly, curious reassuring expression. Do not rotate entire body. Same 3D matte rendering, real transparent alpha, no props or background.

## Orman — `public/scenes/forest-clearing.webp`

Beautiful serene stylized 3D animated-film woodland clearing. NO characters, owls, animals, text, letters, UI or signs. Broad quiet warm ivory sand path foreground, low mossy flat stone toward right, distant rounded treetops and charming treehouse far right midground, soft blue sky. Framing leaves in top corners. Sage/mint foliage, cream ground, golden sunlight, lavender shadows, deep-blue roof accent. Calm empty areas for separately overlaid UI and owl. Edge-to-edge landscape 3:2.

## Hikâye sayfaları — `public/story/nova-v2/happy-1.webp` … `happy-4.webp`

Shared prompt: Production children's story illustration, wide landscape 3:2. Exact reference owl identity: indigo sculpted feather layers, ivory face discs and belly, blue eyes, amber beak and feet, tiny mint feather tips. Soft matte stylized 3D animated-film world, sage foliage, warm cream ground, broad shapes and calm background. Full subjects within central 75 percent. No text, captions, letters, numbers, symbols, UI, borders, watermark or collage. Eye-level camera, no hats or clothes.

1. Nova smiles in bright warm morning sunlight, standing in a sunny meadow in a forest clearing. Blue sky, a few flowers, friendly relaxed eyes. Happiness and warm sunshine.
2. Nova introduces herself proudly, points one folded wing toward her chest, cheerful open eyes, only Nova in frame, sunny woodland clearing.
3. Nova looks up in delight at two small songbirds singing on a low branch: ONE clearly yellow and ONE clearly blue bird, both visible, sunny woodland clearing.
4. Nova and her friend Bolt, a small friendly rounded turquoise-and-cream toy robot with a simple dark face screen, look at one another joyfully and wave one wing/arm. Robot shorter than Nova, same sunny clearing, friendship. No rabbit.

## Meshy

Girdi: nötr Nova PNG'si. Web arayüzünde Image to 3D → Smart Topology → Meshy T2.5 → 15.000 hedef poligon → doku açık → CC BY 4.0 (hesapta açık seçenek). Kullanıcının mevcut kredi kullanma talimatıyla üretildi. Modelin dışa aktarılması abonelik ekranıyla engellendiği için model uygulama varlıkları arasına eklenmedi.
