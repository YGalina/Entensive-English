"use client";

// «Моя лента»: пользовательские книги (Project Gutenberg) и видео (YouTube).
// Галина вставляет ссылку — существующие конвейеры (главы Gutenberg, плеер)
// делают из неё тренажёр. Хранение — storage-адаптер (устройство/браузер).

import { useSyncExternalStore } from "react";
import { storage } from "./storage";

export type MyVideo = { youtubeId: string; title: string; addedAt: string };
export type MyBook = { gutenbergId: number; title: string; addedAt: string };
export type MyLibrary = { videos: MyVideo[]; books: MyBook[] };

const KEY = "ie_my_library";
const listeners = new Set<() => void>();
const EMPTY: MyLibrary = { videos: [], books: [] };

function read(): MyLibrary {
  try {
    const raw = JSON.parse(storage().getItem(KEY) ?? "null") as MyLibrary | null;
    if (!raw || !Array.isArray(raw.videos) || !Array.isArray(raw.books)) return EMPTY;
    return raw;
  } catch {
    return EMPTY;
  }
}

function write(lib: MyLibrary) {
  storage().setItem(KEY, JSON.stringify(lib));
  listeners.forEach((l) => l());
}

/** Достаёт YouTube id из любой формы ссылки (watch/shorts/embed/youtu.be/голый id). */
export function parseYoutubeId(input: string): string | null {
  const s = input.trim();
  if (/^[A-Za-z0-9_-]{11}$/.test(s)) return s;
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{11})/,
    /[?&]v=([A-Za-z0-9_-]{11})/,
    /youtube\.com\/(?:shorts|embed|live)\/([A-Za-z0-9_-]{11})/,
  ];
  for (const re of patterns) {
    const m = s.match(re);
    if (m) return m[1];
  }
  return null;
}

/** Достаёт Gutenberg id: gutenberg.org/ebooks/1342, /files/1342/…, голое число. */
export function parseGutenbergId(input: string): number | null {
  const s = input.trim();
  if (/^\d{1,6}$/.test(s)) return Number(s);
  const m = s.match(/gutenberg\.org\/(?:ebooks|files|cache\/epub)\/(\d{1,6})/);
  return m ? Number(m[1]) : null;
}

/** Заголовок из сырого текста Gutenberg (шапка до START содержит "Title: …"). */
export function titleFromGutenbergRaw(raw: string): string | null {
  const m = raw.slice(0, 4000).match(/^Title:\s*(.+)$/m);
  return m ? m[1].trim().replace(/\s+/g, " ") : null;
}

export function addMyVideo(youtubeId: string, title: string) {
  const lib = read();
  if (lib.videos.some((v) => v.youtubeId === youtubeId)) return;
  write({
    ...lib,
    videos: [{ youtubeId, title, addedAt: new Date().toISOString() }, ...lib.videos],
  });
}

export function removeMyVideo(youtubeId: string) {
  const lib = read();
  write({ ...lib, videos: lib.videos.filter((v) => v.youtubeId !== youtubeId) });
}

export function addMyBook(gutenbergId: number, title: string) {
  const lib = read();
  if (lib.books.some((b) => b.gutenbergId === gutenbergId)) return;
  write({
    ...lib,
    books: [{ gutenbergId, title, addedAt: new Date().toISOString() }, ...lib.books],
  });
}

export function removeMyBook(gutenbergId: number) {
  const lib = read();
  write({ ...lib, books: lib.books.filter((b) => b.gutenbergId !== gutenbergId) });
}

/** Дозаполнить заголовок книги, когда узнали его из текста. */
export function setMyBookTitle(gutenbergId: number, title: string) {
  const lib = read();
  write({
    ...lib,
    books: lib.books.map((b) => (b.gutenbergId === gutenbergId ? { ...b, title } : b)),
  });
}

function subscribe(cb: () => void) {
  listeners.add(cb);
  const un = storage().subscribeExternal(cb);
  return () => {
    listeners.delete(cb);
    un();
  };
}

function snapshot(): string {
  return storage().getItem(KEY) ?? "";
}

export function useMyLibrary(): MyLibrary {
  const raw = useSyncExternalStore(subscribe, snapshot, () => "");
  try {
    const lib = raw ? (JSON.parse(raw) as MyLibrary) : EMPTY;
    if (!lib || !Array.isArray(lib.videos) || !Array.isArray(lib.books)) return EMPTY;
    return lib;
  } catch {
    return EMPTY;
  }
}
