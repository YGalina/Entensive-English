# Хэндофф на аудио-производство · Stage 0 «Work Conversation»

Статус: готов к передаче звукорежиссёру/дикторам **после** Codex-приёмки этого коммита.
Источник текстов: `CONTENT_AND_RIGHTS_REGISTER.md` (авторитетен при расхождении). Скрипты продублированы здесь дословно, чтобы документ был самодостаточен на записи.
**Записи — только живые люди. TTS запрещён.** Аудио в этом проходе не генерируется — это план записи.

---

## 0. Обязательное поле: вариант английского

> **ВАРИАНТ АНГЛИЙСКОГО (заполнить до записи): ______________________**
> Формат: конкретный документируемый вариант, например «британский, юг Англии, современная стандартная разговорная норма» или «американский, General American».
> Правила: **один вариант на весь модуль**; оба голоса — уверенные говорящие одного варианта; слово **«нейтральный» не используется** (нейтральных акцентов не существует). Выбор зависит от доступных дикторов и утверждается владельцем при букинге — это **нерешённый пункт** хэндоффа.

## 1. Голоса

| Голос | Роль | Требования |
|---|---|---|
| **V1 — женский** | Anna (героиня-учащаяся) во всех диалогах; монологи T2, T4; подруга в T5; произносительные образцы P1/P2 | 30–50 лет по звучанию; спокойная, живая, без «дикторской» подачи |
| **V2 — мужской** | менеджер (T1), коллега/менеджер (T3), реплики сценариев A6 | тот же вариант английского, что V1 |

Правило темпа: **обычную и беглую версию одного текста записывает один и тот же голос в одну сессию** (различие только в темпе и редукциях, не в тембре дня).

## 2. Инвентарь записей (мастера)

| ID | Текст | Голоса | Темп | Ориентир длительности | Файл |
|---|---|---|---|---|---|
| A1 | T1 «Monday stand-up» (диалог, 100 слов) | V2+V1 | обычный ~130 сл/мин | 45–60 с | `stage0_A1_normal_t01.wav` |
| A1-f | тот же T1 | V2+V1 | беглый ~175 сл/мин | 35–45 с | `stage0_A1f_fluent_t01.wav` |
| A2 | T2 «Update before the call» (монолог, 96 слов) | V1 | обычный | 40–55 с | `stage0_A2_normal_t01.wav` |
| A2-f | тот же T2 | V1 | беглый | 30–40 с | `stage0_A2f_fluent_t01.wav` |
| A3 | T3 «Can you move the review?» (диалог, 108 слов) | V1+V2 | обычный | 50–65 с | `stage0_A3_normal_t01.wav` |
| A4 (опц.) | T4 модель письма (67 слов) | V1 | обычный, чтение | 30–40 с | `stage0_A4_normal_t01.wav` |
| A5 | T5 «Coffee with a friend» (4 реплики подруги, 46 слов) | V1 | обычный, разговорный | реплики отдельно, паузы см. §6 | пореплично `stage0_A5_r1..r4_normal_t01.wav` |
| A6-1 | сценарная реплика 1 | V2 | обычный | 3–5 с | `stage0_A6s1_normal_t01.wav` |
| A6-2 | сценарная реплика 2 | V2 | обычный | 3–5 с | `stage0_A6s2_normal_t01.wav` |
| A6-2r | reprise «Sorry — say that again?» | V2 | обычный | 1–2 с | `stage0_A6s2r_normal_t01.wav` |
| A6-3 | сценарная реплика 3 | V2 | обычный | 2–4 с | `stage0_A6s3_normal_t01.wav` |
| P1 | 3 пары ударения + 3 фразы артикуляции | V1 | обычный, чёткий | пофайлово | `stage0_P1_[item]_t01.wav` |
| P2 | `estimate` глагол/сущ. — 2 фразы | V1 | обычный | пофайлово | `stage0_P2_[verb|noun]_t01.wav` |

**Итого мастеров: 12 обязательных + 1 опциональный (A4).** Нарезки (D-клипы, shadowing) — не отдельные записи, а монтаж из мастеров (§7).

## 3. Скрипты (дословно; менять слова запрещено)

### A1 / A1-f · T1 (V2 = М, V1 = А)
```
М: So, what are you working on at the moment?
А: I've been working on the new onboarding flow. It's a bigger job than I expected.
М: And you're running that project on your own?
А: More or less. I get help with the design, but the planning is mine.
М: What about the date? Still the fifteenth?
А: Yes. We should meet the deadline, but it'll be tight.
М: If it slips, tell me early. That's all I ask.
А: Of course. Actually, I came up with a way to cut one step — I'll show you tomorrow.
М: That makes sense. Send me a note before the call.
```

### A2 / A2-f · T2 (V1, голосовое сообщение)
```
Hi Anna, quick update before the call.
I've been working on the migration all week. Yesterday I finished the first part, so that's done.
The thing is, the old data is messier than we thought. I spent most of Wednesday just reading it.
It's challenging — not impossible, but slow.
I've been trying to figure out why some records are duplicated, and I found the reason this morning: two systems were writing at the same time.
So my estimate has changed. On Monday I said three days. Now I'd estimate five.
Tell me if that's a problem.
```

### A3 · T3 (V1 = А, V2 = М)
```
А: Do you have a minute? We may need to move the review.
М: Go on.
А: It turned out that the client can't join on Thursday — their team is travelling.
М: So you want to put it off until next week?
А: That's one option. Or we run it without them and send a summary.
М: Hm. It's up to you — you know the details better than I do.
А: The thing is, half the open questions are theirs. What I'm trying to do is sort them out with the client in the room.
М: Fine, move it. Can you tell the others today?
А: I'll get back to you by five with a new time.
```

### A4 (опц.) · T4 (V1, ровное чтение)
```
Hi Mark,
Quick status on the migration.
I've been working on the data clean-up since Monday, and I finished the first batch yesterday. The thing is, the old records are messier than we estimated, so I'd now say five days rather than three.
What I'm trying to do is get the second batch done before the review. I'll get back to you if anything changes.
Anna
```

### A5 · T5 (V1, подруга; дружеский регистр, заметно неформальнее рабочих записей)
```
r1: I haven't seen you in ages! How's work these days?
r2: That sounds like a lot. Is it the same thing you told me about in the spring?
r3: And is it nearly done, or will it drag on forever?
r4: Well, if you survive it, dinner's on me.
```

### A6 · сценарные реплики (V2)
```
s1:  Can we move Thursday? I'm double-booked.
s2:  Why is this taking longer than you said?
s2r: Sorry — say that again?
s3:  So what happens next?
```

### P1 · ударение на частице — ТОЛЬКО ТРИ ЕДИНИЦЫ

**Использует исключительно скорректированное произносительное правило коммита `7982972`:** в набор входят **только** `figure out`, `sort out`, `put off`. **`come up with` в P1 отсутствует и не записывается** — выделенность этой единицы зависит от информационной структуры и следующего содержания; файл вида «come up WITH» не создаётся ни при каких условиях.

Пары (каждый вариант — отдельный файл; «сдвинутый» вариант нужен для перцептивного задания):
```
P1_figure_a:  FIgure out        (пик на глаголе — контрастный вариант)
P1_figure_b:  figure OUT        (пик на частице — целевой)
P1_sort_a:    SORT out
P1_sort_b:    sort OUT
P1_put_a:     PUT off
P1_put_b:     put OFF
```
Фразы артикуляции (целевая просодия, местоимение внутри):
```
P1_phrase1: I need to figure it out.
P1_phrase2: Let's sort it out today.
P1_phrase3: We put it off until Monday.
```

### P2 · estimate
```
P2_verb:  I'd estimate five days.        (глагол /ˈestɪmeɪt/)
P2_noun:  My estimate has changed.       (существительное /ˈestɪmət/)
```

## 4. Требования к темпу

- **Обычный темп:** ~120–140 слов/мин; естественные паузы; ясная, но НЕ учительская дикция.
- **Беглый темп (A1-f, A2-f):** ~165–185 слов/мин; **полные естественные редукции и связки** — именно они нужны decoding-заданиям: `I've been` → /aɪvbɪn/ слитно; `came up with a` → /keɪmʌpwɪðə/; `should` /ʃəd/, `the` /ðə/; `trying to` → /ˈtraɪɪntə/; `I'd` /aɪd/. Беглый ≠ торопливый: это нормальная связная речь, не скороговорка.

## 5. Произносительные заметки для дикторов

`deadline` — ударение на первом слоге · `challenging` — /ˈtʃæləndʒɪŋ/, ударение на первом · `estimate`: глагол /-meɪt/, существительное /-mət/ (критично в A2: в тексте есть ОБА — *my estimate has changed* (сущ.) и *I'd estimate five* (глагол)) · в P1-фразах пик на частице, местоимение `it` безударно · в A5 регистр дружеский: допускаются лёгкие интонационные улыбки, но слова — строго по скрипту.

## 6. Порядок записи (одна сессия на голос; беглые сразу после обычных)

1. V1+V2: **A1 обычный** → сразу **A1-f беглый** (те же люди, та же посадка).
2. V1: **A2** → **A2-f**.
3. V1+V2: **A3**.
4. V2: **A6** (s1, s2, s2r, s3 — отдельными файлами).
5. V1: **A5** (r1–r4 отдельными файлами; после каждой реплики — 1 с тишины; паузы 8–10 с для ответа добавляются на монтаже, не в студии).
6. V1: **P1, P2** — ⚠️ **только после** Codex-приёмки произносительной коррекции `7982972`.
7. V1: **A4** (если пишем).

## 7. Карта нарезки (монтаж из мастеров, отдельно не записывать)

| Клип | Из мастера | Фрагмент | Длина |
|---|---|---|---|
| D1 | **A1-f** | *I've been working on…* | 2–4 с |
| D2 | **A1-f** | *I came up with a way…* | 2–4 с |
| D3 | **A1-f** | *We should meet the deadline* | 2–4 с |
| D4 | **A2-f** | *I've been trying to figure out…* | 2–4 с |
| D5 | **A2-f** | *Now I'd estimate five.* | 2–3 с |
| D6 | **A2-f** | *my estimate has changed* | 2–3 с |
| SH1 | **A1** (обычный!) | *I've been working on the new onboarding flow.* | по фразе |
| SH2 | **A1** | *We should meet the deadline, but it'll be tight.* | по фразе |
| SH3 | **A1** | *I came up with a way to cut one step.* | по фразе |

Правила нарезки: границы по естественным стыкам, без обрезания начальных согласных; 150–250 мс тишины по краям; без fade-эффектов внутри речи.

## 8. Запрещённые интерпретации

- никакого TTS, клонирования голоса и «улучшения» речи нейросетями;
- не менять, не добавлять и не выбрасывать слова (междометий в скриптах нет — значит и в записи нет);
- обычный темп — не «учительская диктовка» с паузами после каждого слова;
- беглый темп — не скороговорка и не небрежность: редукции естественные, разборчивость сохраняется;
- не «играть» эмоции сверх написанного (T2 — деловое голосовое, не драма; T5 — тепло, не театр);
- не записывать вариант «come up WITH» с пиком на with — такого файла в наборе нет;
- не смешивать варианты английского между голосами и между дублями;
- не называть выбранный акцент «нейтральным» ни в метаданных, ни в отчёте.

## 9. Форматы

- **RAW (мастер):** WAV, моно, **48 кГц / 24 бит**, пики ≤ −6 dBFS, шумовой пол ≤ −55 dBFS; тихая комната, без реверберации; без обработки (EQ/компрессия/шумодав — нет).
- **Экспорт (доставка в модуль):** WAV 44.1 кГц / 16 бит **и** MP3 320 kbps CBR; нормализация −16 LUFS integrated (моно).
- Каждый ID — отдельный файл; дубли храним (`_t01`, `_t02`…); в доставку идёт один утверждённый дубль.

## 10. Конвенция имён

`stage0_[ID]_[tempo]_[take].[ext]` — строчными, без пробелов:
`stage0_A1_normal_t01.wav` · `stage0_A1f_fluent_t01.wav` · `stage0_A5_r2_normal_t01.wav` · `stage0_A6s2r_normal_t01.wav` · `stage0_P1_figure_b_normal_t01.wav` · `stage0_P2_verb_normal_t01.wav`.
Нарезки: `stage0_D4_cut_v01.wav` · `stage0_SH1_cut_v01.wav`. Экспортные копии — тот же корень + суффикс `_exp` перед расширением.

## 11. Критерии приёмки каждой записи

**Общие (все файлы):** текст дословно по скрипту (0 отклонений) · заявленный голос и один вариант английского · моно 48/24, пики ≤ −6 dBFS, шум ≤ −55 dBFS · без клиппинга, щелчков, эха и посторонних звуков · темп в коридоре своего класса (§4).
**По типам:** A1-f/A2-f — редукции из §4 присутствуют и слышны (проверка по списку D-фраз) · A5 — регистр заметно неформальнее A1–A3; реплики отдельными файлами · A6 — каждая реплика самостоятельна, без сценического нажима · **P1 — в парах `_a`/`_b` пик различим с первого прослушивания** · **P2 — финальные гласные /-meɪt/ и /-mət/ различимы** · D-клипы — целевая фраза целиком, границы чистые · SH — фраза целиком, обычный темп.

## 12. QA-чеклист сессии

- [ ] Поле «вариант английского» (§0) заполнено до первой записи; совпадает у V1 и V2
- [ ] Профили дикторов зафиксированы (вариант английского, как подтверждён)
- [ ] A1→A1-f и A2→A2-f записаны одними голосами в одну сессию
- [ ] Все 12 обязательных мастеров записаны и названы по конвенции §10
- [ ] **P1/P2 записаны только после Codex-приёмки коррекции `7982972`; файла «come up WITH» не существует**
- [ ] D1–D6 и SH1–SH3 нарезаны по карте §7
- [ ] Каждый файл прошёл критерии §11 (прослушано двумя людьми)
- [ ] RAW и экспортные версии сохранены; дубли не удалены
- [ ] В метаданных и отчёте нет слова «нейтральный» об акценте
