// Web-вариант адаптера хранилища (Metro берёт .web.ts для платформы web).
// Нужен, чтобы мобильное приложение собиралось и под react-native-web —
// это среда быстрой проверки UI. На вебе expo-sqlite тянет wa-sqlite.wasm,
// который здесь не нужен: берём обычный localStorage (+ событие storage).
import type { StorageAdapter } from "@ie/core/storage";

export const kvStorage: StorageAdapter = {
  getItem: (key) => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  },
  setItem: (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch {}
  },
  subscribeExternal: (cb) => {
    if (typeof window === "undefined") return () => {};
    window.addEventListener("storage", cb);
    return () => window.removeEventListener("storage", cb);
  },
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

/** Web parity for the one-time owner QA reset used by the shared root layout. */
export function resetOwnerQaProgressOnce(): void {
  if (!__DEV__ || kvStorage.getItem(QA_RESET_MARKER) === "1") return;
  for (const key of QA_PROGRESS_KEYS) kvStorage.setItem(key, "");
  kvStorage.setItem(QA_RESET_MARKER, "1");
}
