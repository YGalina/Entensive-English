// Платформенный адаптер хранилища для @ie/core: expo-sqlite/kv-store.
// Синхронный API (getItemSync/setItemSync) — ровно контракт StorageAdapter,
// работает в Expo Go без нативной сборки. Прогресс живёт локально на
// устройстве; облачный синк подключится в фазе аккаунтов.

import Storage from "expo-sqlite/kv-store";
import type { StorageAdapter } from "@ie/core/storage";

export const kvStorage: StorageAdapter = {
  getItem: (key) => {
    try {
      return Storage.getItemSync(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      Storage.setItemSync(key, value);
    } catch {}
  },
  // Внешних изменений на устройстве нет (один процесс) — внутренние записи
  // оповещают слушателей на уровне модулей @ie/core сами.
  subscribeExternal: () => () => {},
};

const QA_RESET_MARKER = "ie_qa_reset_20260808_2";
const QA_PROGRESS_KEYS = [
  "ie_active_path",
  "ie_integrity_blocked",
  "ie_profile",
  "ie_profile_path",
  "ie_resume_draft",
  "ie_open_protocol_stage",
  "ie_recovery_needed",
  "ie_daily_step",
  "ie_daily_step_locked",
  "ie_stage0_day1",
  "ie_s5_draft",
  "ie_slice_state",
  "ie_slice_log",
  "ie_slice_srs",
] as const;

/** Одноразово очищает только учебное QA-состояние владельца в Expo Go. */
export function resetOwnerQaProgressOnce(): void {
  if (!__DEV__ || kvStorage.getItem(QA_RESET_MARKER) === "1") return;
  for (const key of QA_PROGRESS_KEYS) kvStorage.setItem(key, "");
  kvStorage.setItem(QA_RESET_MARKER, "1");
}
