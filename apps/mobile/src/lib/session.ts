import { useSyncExternalStore } from "react";
import { storage } from "@ie/core/storage";

// Сессия mobile: самоподписанный токен, полученный по deep-link из verify.
// Храним в том же адаптере, что и прогресс (kv-store). Токен уходит на сервер
// как Authorization: Bearer — серверной таблицы сессий нет, проверка по подписи.

const KEY = "ie_session_token";
const listeners = new Set<() => void>();

export function getSessionToken(): string | null {
  const v = storage().getItem(KEY);
  return v ? v : null;
}

export function setSessionToken(token: string) {
  storage().setItem(KEY, token);
  listeners.forEach((l) => l());
}

export function clearSessionToken() {
  // Адаптер без removeItem — пустая строка трактуется как «нет токена».
  storage().setItem(KEY, "");
  listeners.forEach((l) => l());
}

/** Заголовок авторизации для запросов синка (пустой объект без токена). */
export function authHeader(): Record<string, string> {
  const t = getSessionToken();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

function subscribe(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

function snapshot(): string {
  return getSessionToken() ?? "";
}

/** Реактивный флаг «вошёл ли» — перерисовывает профиль при входе/выходе. */
export function useLoggedIn(): boolean {
  const v = useSyncExternalStore(subscribe, snapshot, snapshot);
  return v.length > 0;
}
