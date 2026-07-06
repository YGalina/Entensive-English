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
