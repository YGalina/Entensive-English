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
