# Conversation Scenario Script Brief Template

Use this template when writing a new conversation scenario for Nova ile Konuş.

> **Not:** Aşağıdaki checkbox'lar her YENİ senaryo için kullanılan review
> şablonunu oluşturur. Boş `[ ]` madde işaretleri global proje durumunu
> göstermez; sadece o senaryonun review çıktısı için doldurulur.

---

## 1. Metadata

| Field             | Value                                               |
| ----------------- | --------------------------------------------------- |
| **Scenario ID**   | `phase1_{theme}_{short_name}`                       |
| **Theme**         | animals / food / colors / toys / emotions / routine |
| **Sub-theme**     | e.g. `pet_shop`, `fruit_stand`                      |
| **Target age**    | `4_6` / `7_9` / `10_12`                             |
| **Difficulty**    | `starter` / `core` / `stretch`                      |
| **Mode**          | `guided` (prompted) / `semi_open` / `open_ended`    |
| **Energy**        | `calm` / `playful` / `adventurous`                  |
| **Est. duration** | seconds (60-120 typical)                            |
| **Turn count**    | number of child-response turns                      |

## 2. Learning Objectives

- **Target words** (min 3): `word1`, `word2`, `word3`, …
- **Target patterns**: `I want…`, `It is…`, etc.
- **Learning goals** (plain language): what the child should be able to do after this conversation

## 3. Scene Setup

- **Scene emoji**: 🎯
- **Nova's role**: e.g. shopkeeper, guide, friend
- **Setting**: 1-2 sentence description

## 4. Dialogue Flow

Write the flow as a numbered node list:

```
n1 [nova] "Welcome! ..." → responds → n2_a, n2_b
n2_a [nova] "Great choice!" → n3
n2_b [nova] "Cool!" → n3
n3 [nova] "Now tell me..." → responds → n4_x, n4_y
n4_x [nova] "Awesome!" (terminal)
n4_y [nova] "Wonderful!" (terminal)
```

For each response node, specify:

- Expected text (English)
- Turkish translation
- Accepted variants (minimal fragments that still count)
- Accepted keywords
- Which target words/patterns it marks

## 5. Hints & Repairs

For each child-response node:

| Node | Hint delay | Hint text            | Repair prompt             | Max retries |
| ---- | ---------- | -------------------- | ------------------------- | ----------- |
| n1   | 8000ms     | "Try: I want a dog." | "Say: I want a dog."      | 2           |
| n3   | 7000ms     | "Try: It is big."    | "You can say: It is big." | 2           |

## 6. Success Criteria

| Criteria                | Value               |
| ----------------------- | ------------------- |
| Min accepted turns      | 2                   |
| Min target words hit    | 2                   |
| Required patterns       | `I want…`, `It is…` |
| Allow hinted completion | `true`              |

## 7. Variants

Every scenario must have ≥ 2 variants:

| Variant ID | Label   | Style     |
| ---------- | ------- | --------- |
| `default`  | Default | `default` |
| `playful`  | Playful | `playful` |

## 8. Reward

| Field     | Value                            |
| --------- | -------------------------------- |
| Type      | `sticker` / `badge` / `xp_bonus` |
| Reward ID | e.g. `pet-sticker`               |

## 9. Selection Policy

| Field                       | Value          |
| --------------------------- | -------------- |
| Priority                    | 100 (default)  |
| Repeat cooldown             | 3 days         |
| Preferred if tags seen      | `[theme tags]` |
| Avoid if completed recently | `true`         |

---

## Checklist Before Submitting

- [ ] Scenario ID follows naming convention
- [ ] At least 3 target words defined
- [ ] At least 1 target pattern defined
- [ ] All response nodes have `acceptedVariants` and `acceptedWords`
- [ ] Hints on every child-response node (delay 6000-10000ms)
- [ ] Repair on every child-response node (maxRetries ≥ 1)
- [ ] At least 2 variants defined
- [ ] Success criteria filled in
- [ ] Terminal nodes have no `next` or `responses`
- [ ] All `nextNodeId` references point to valid node IDs
- [ ] Turkish translations provided for all text fields
