// ===== Product Learner Profile store (PR 3) =====
// Продуктовый (не pilot) профиль входа: пять наблюдаемых признаков S3.
// Профиль ПРИНАДЛЕЖИТ активной локальной траектории (см. entryRouting): при
// сохранении, если активного пути ещё нет, он заводится здесь. Это и есть точка,
// где создаётся active local path на первом сохранении профиля. После сохранения
// `readPathState().hasProfile` = true → роутер ведёт в Path Hub.
//
// Владелец состояния — Profile (03_INFORMATION_ARCHITECTURE). Здесь только запись/
// чтение локально; никаких заявлений об уровне/CEFR — это наблюдаемые признаки.

"use client";

import { storage } from "./storage";
import { ENTRY_KEYS, activeLocalPath } from "./entryRouting";

/** Ответ по признаку: да / нет / не могу оценить (легальный ответ). */
export type SignAnswer = "yes" | "no" | "insufficient";

/** Пять наблюдаемых признаков входа (S3). Семантика — в спеке 06 / S3. */
export type ProfileSigns = {
  s1: SignAnswer;
  s2: SignAnswer;
  s3: SignAnswer;
  s4: SignAnswer;
  s5: SignAnswer;
};

export type LearnerProfile = {
  signs: ProfileSigns;
  note: string;
  savedAt: number;
  /** Локальная траектория, которой принадлежит профиль. */
  path: string;
};

/** Частичный набор ответов в процессе заполнения (для проверки полноты). */
export type PartialSigns = Partial<ProfileSigns>;

const SIGN_KEYS: (keyof ProfileSigns)[] = ["s1", "s2", "s3", "s4", "s5"];

/** Все пять признаков отмечены (любым из трёх ответов, включая insufficient). */
export function isComplete(partial: PartialSigns): partial is ProfileSigns {
  return SIGN_KEYS.every((k) => partial[k] != null);
}

export type SaveResult =
  | { ok: true; profile: LearnerProfile }
  | { ok: false; reason: "storage-unavailable" };

/**
 * Сохранить профиль в активную локальную траекторию. Если активного пути нет —
 * завести его (`path-${now}`). Запись проверяется чтением: если хранилище
 * недоступно (read-back пуст), возвращается честный not-saved.
 * Профиль НЕ перезаписывает уже завершённый профиль той же траектории молча —
 * повторный вызов идемпотентно обновляет ту же запись явным действием.
 */
export function saveProfile(signs: ProfileSigns, note: string, now: number = Date.now()): SaveResult {
  const s = storage();
  let path = activeLocalPath();
  if (path == null) {
    path = `path-${now}`;
    s.setItem(ENTRY_KEYS.activePath, path);
  }
  const profile: LearnerProfile = { signs, note, savedAt: now, path };
  const serialized = JSON.stringify(profile);
  s.setItem(ENTRY_KEYS.profile, serialized);
  s.setItem(ENTRY_KEYS.profilePath, path);

  // Сохранение считается успешным ТОЛЬКО если чтение подтверждает все три факта.
  // Присутствие какого-то профиля доказательством не считается: старая запись,
  // пережившая сброшенную запись (приватный режим/квота), — это НЕ успех.
  const backActive = s.getItem(ENTRY_KEYS.activePath);
  // (1) активная траектория — та, в которую мы сохраняли;
  if (backActive !== path) return { ok: false, reason: "storage-unavailable" };
  // (2) прочитанный профиль ТОЧНО равен только что сериализованному;
  if (s.getItem(ENTRY_KEYS.profile) !== serialized) return { ok: false, reason: "storage-unavailable" };
  // (3) штамп профиля равен активной траектории.
  if (s.getItem(ENTRY_KEYS.profilePath) !== backActive) return { ok: false, reason: "storage-unavailable" };

  return { ok: true, profile };
}

/**
 * Прочитать профиль, ТОЛЬКО если он принадлежит активной локальной траектории.
 * После перезапуска целостности активный путь меняется → старый профиль не читается.
 */
export function readProfile(): LearnerProfile | null {
  const s = storage();
  const raw = s.getItem(ENTRY_KEYS.profile);
  if (raw == null) return null;
  const boundPath = s.getItem(ENTRY_KEYS.profilePath);
  const active = s.getItem(ENTRY_KEYS.activePath);
  if (boundPath == null || active == null || boundPath !== active) return null;
  try {
    const p = JSON.parse(raw) as LearnerProfile;
    // Профиль валиден, только если его собственный path совпадает с активным.
    return p && p.path === active ? p : null;
  } catch {
    return null;
  }
}
