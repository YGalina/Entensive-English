// Адаптер хранилища — единственная точка, где логика прогресса касается
// платформы. Web = localStorage (+ событие "storage" для синхры вкладок),
// mobile = MMKV (конфигурируется на старте приложения через configureStorage),
// тесты = память. Логика модулей (prefs/timelog/srs/wpm) платформы не знает.

export type StorageAdapter = {
  /** null — ключа нет или хранилище недоступно (никогда не бросает). */
  getItem(key: string): string | null;
  /** Молча глотает ошибки квоты/приватного режима (как прежний try/catch). */
  setItem(key: string, value: string): void;
  /**
   * Подписка на ВНЕШНИЕ изменения (другая вкладка/процесс). Внутренние записи
   * оповещают слушателей сами — на уровне модулей, как и раньше.
   */
  subscribeExternal(cb: () => void): () => void;
};

/** Память процесса: SSR, тесты, платформа без настроенного адаптера. */
export function memoryStorage(): StorageAdapter {
  const m = new Map<string, string>();
  return {
    getItem: (k) => m.get(k) ?? null,
    setItem: (k, v) => {
      m.set(k, v);
    },
    subscribeExternal: () => () => {},
  };
}

/** Браузерный localStorage — поведение 1:1 с прежним кодом модулей. */
function webStorage(): StorageAdapter {
  return {
    getItem: (k) => {
      try {
        return localStorage.getItem(k);
      } catch {
        return null;
      }
    },
    setItem: (k, v) => {
      try {
        localStorage.setItem(k, v);
      } catch {}
    },
    subscribeExternal: (cb) => {
      window.addEventListener("storage", cb);
      return () => window.removeEventListener("storage", cb);
    },
  };
}

let backend: StorageAdapter | null = null;

/**
 * Явная настройка платформенного адаптера (mobile: MMKV; тесты: memoryStorage).
 * Вызывать до первого обращения к prefs/timelog/srs/wpm.
 */
export function configureStorage(adapter: StorageAdapter) {
  backend = adapter;
}

/** Текущий адаптер. Без настройки: браузер → localStorage, иначе память. */
export function storage(): StorageAdapter {
  if (!backend) {
    backend =
      typeof window !== "undefined" && typeof localStorage !== "undefined"
        ? webStorage()
        : memoryStorage();
  }
  return backend;
}
