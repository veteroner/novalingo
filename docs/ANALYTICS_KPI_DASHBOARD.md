# NovaLingo — Analytics KPI & Dashboard Spesifikasyonu

> Pilot ve launch sonrası ölçüm için referans dokümanı.
> Roadmap 7A kapsamındaki "Firebase Analytics dashboard kur" ve "KPI baseline" maddelerinin temelidir.
> Tüm event'ler `src/services/analytics/analyticsService.ts` içinde tanımlı.

---

## 1. Dashboard Yapısı (Firebase Console → Analytics → Dashboard)

Önerilen widget düzeni (tek ekrana sığar):

| Sıra | Widget                       | Kaynak                                                     | Segment                 |
| ---- | ---------------------------- | ---------------------------------------------------------- | ----------------------- |
| 1    | Günlük Aktif Kullanıcı (DAU) | Predefined metric                                          | All users · pilotCohort |
| 2    | Retention Matrix (D1/D7/D30) | Retention report                                           | All · pilotCohort       |
| 3    | Ortalama oturum süresi       | `average_engagement_time_per_session`                      | All · pilotCohort       |
| 4    | Dropout by screen            | `screen_view` funnel: Home → Lesson → Result               | All · pilotCohort       |
| 5    | Ders tamamlama oranı         | `lesson_completed / lesson_started`                        | All · pilotCohort       |
| 6    | Konuşma deneme hacmi         | `conversation_turn_completed` + `conversation_completed`   | All · pilotCohort       |
| 7    | Hint kullanım oranı          | `conversation_hint_shown / conversation_turn_completed`    | All · pilotCohort       |
| 8    | İçerik fallback oranı        | `lesson_content_fallback_summary` (dashboardda ters trend) | All                     |
| 9    | Streak dağılımı              | Audience builder: `child.currentStreak` > 3 / 7 / 14       | All                     |
| 10   | Crash-free rate              | Firebase Crashlytics entegre widget                        | All                     |

## 2. KPI Formülleri

```text
D1 Retention       = (ilk gün sonrası 1. günde geri dönen UID) / (1. gün toplam UID)
D7 Retention       = (7. günde aktif olan UID) / (kohort başlangıç UID)
Lesson Completion  = lesson_completed.count / lesson_started.count
Conversation Rate  = conversation_completed.count / conversation_started.count
Hint Usage         = conversation_hint_shown.count / conversation_turn_completed.count
Fallback Rate      = lesson_content_fallback_summary.fallback_word_count / lesson_content_fallback_summary.total_word_count
```

## 3. Pilot Segmentasyonu

Pilot ebeveynler için `users/{uid}.pilotCohort` alanı set edilir (örn: `pilot-2026-04`). Analytics tarafında:

1. **Firebase Audience** oluştur:
   - Ad: `Pilot Cohort — 2026-04`
   - Koşul: `user_property: pilot_cohort CONTAINS pilot-2026-04`
2. Dashboard widget'larını bu audience'la filtrele.
3. Client tarafında `setUserProperty('pilot_cohort', value)` çağrısı onboarding tamamlanınca yapılır.

> Not: `pilotCohort` değerini BigQuery export'unda da kullanabilirsin (Firebase → BigQuery link).

## 4. Event Sözleşmesi — KPI Okuması İçin Kullanılan Event'ler

| Event                             | Amaç                                     | Parametre (seçilmiş)                                                   |
| --------------------------------- | ---------------------------------------- | ---------------------------------------------------------------------- |
| `lesson_started`                  | funnel başı                              | `lesson_id`, `world_id`                                                |
| `lesson_completed`                | completion, accuracy                     | `lesson_id`, `accuracy`, `xp_earned`, `time_ms`                        |
| `activity_completed`              | per-activity drilldown                   | `type`, `success`, `time_ms`                                           |
| `conversation_started`            | konuşma engagement                       | `scenario_id`, `age_group`                                             |
| `conversation_turn_completed`     | attempt hacmi                            | `accepted`, `used_hint`                                                |
| `conversation_hint_shown`         | zorluk baskısı                           | `scenario_id`, `node_id`                                               |
| `conversation_repair_used`        | recovery sıklığı                         | `scenario_id`                                                          |
| `conversation_completed`          | success rate                             | `passed`, `score`, `accepted_turns`                                    |
| `lesson_content_fallback_summary` | içerik kalite göstergesi                 | `fallback_word_count`, `fallback_with_emoji_count`, `total_word_count` |
| `story_completed`                 | hikaye derinliği                         | `story_id`, `world_id`                                                 |
| `streak_milestone`                | retention motor                          | `days`                                                                 |
| `achievement_unlocked`            | gamification sinyali                     | `achievement_id`                                                       |
| `app_error`                       | hata hacmi (Crashlytics ile karşılaştır) | `context`, `message`                                                   |

> Tüm event isimleri stabil. Yeni event ekleneceği zaman:
>
> 1. `analyticsService.ts` içine ekle.
> 2. Bu tablonun altına bir satır ekle.
> 3. Dashboard widget ekleme ihtiyacı varsa bu dokümanın §1 bölümünü güncelle.

## 5. Canlıda Doğrulama Checklist

- [ ] Dev build ile Firebase **DebugView** açık → Home'a git → `screen_view` görünüyor
- [ ] 1 ders tamamla → `lesson_started` + `lesson_completed` ardışık gelsin
- [ ] 1 konuşma scenario'su tamamla → `conversation_started` + en az 3 `conversation_turn_completed` + 1 `conversation_completed`
- [ ] `setUserProperty('pilot_cohort', 'pilot-2026-04')` sonrası 24 saat içinde Audience listesinde görünüyor
- [ ] Crashlytics test crash tetikle → 5 dk içinde dashboard güncellenir
- [ ] BigQuery export açıksa → `events_*` tablosunda ilgili event_name satırı var

## 6. Pilot KPI Baseline (hedef tablosu)

| KPI                    | Pilot hedefi | 3-Ay hedefi | 6-Ay hedefi |
| ---------------------- | ------------ | ----------- | ----------- |
| D1 Retention           | %55+         | %60         | %70         |
| D7 Retention           | %30+         | %35         | %45         |
| D30 Retention          | —            | %15         | %25         |
| Ortalama oturum süresi | 10 dk+       | 12 dk       | 15 dk       |
| Ders tamamlama         | %70+         | %75         | %80         |
| Hint usage rate        | ≤ %30        | ≤ %25       | ≤ %20       |
| Fallback rate          | ≤ %15        | ≤ %10       | ≤ %5        |
| Crash-free users       | %99+         | %99.5       | %99.5       |

> "Pilot hedefi" sütunu pilot çıktıları geldikten sonra "gerçekleşen" ile değiştirilecek.
