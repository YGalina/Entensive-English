// Поиск видео на YouTube через официальный Data API v3. Ключ — из окружения
// (EXPO_PUBLIC_YOUTUBE_KEY на mobile / NEXT_PUBLIC_YOUTUBE_KEY на web); без
// ключа поиск честно сообщает, что не настроен. Мы не рехостим видео — только
// официальный embed-плеер, ссылка на канал и атрибуция (правовой режим из
// аудита §8): пользователь смотрит в YouTube-плеере, мы строим вокруг shadowing.

export type YouTubeHit = {
  id: string;
  title: string;
  channel: string;
  thumb: string;
};

/** Есть ли ключ API в окружении. UI по этому решает, показывать ли поиск. */
export function youtubeConfigured(): boolean {
  return !!ytKey();
}

function ytKey(): string | undefined {
  // process.env доступен и в Metro (EXPO_PUBLIC_*), и в Next (NEXT_PUBLIC_*).
  const env = typeof process !== "undefined" ? process.env : undefined;
  return (
    env?.EXPO_PUBLIC_YOUTUBE_KEY ||
    env?.NEXT_PUBLIC_YOUTUBE_KEY ||
    undefined
  );
}

export type YouTubeSearchResult =
  | { ok: true; hits: YouTubeHit[] }
  | { ok: false; reason: "no-key" | "network" | "quota" };

/**
 * Ищет до `max` видео по запросу. Взрослый безопасный режим: safeSearch,
 * только видео, встраиваемые (videoEmbeddable) и среднего размера.
 */
export async function searchYouTube(query: string, max = 12): Promise<YouTubeSearchResult> {
  const key = ytKey();
  if (!key) return { ok: false, reason: "no-key" };
  const q = query.trim();
  if (!q) return { ok: true, hits: [] };

  const url =
    "https://www.googleapis.com/youtube/v3/search?part=snippet&type=video" +
    "&videoEmbeddable=true&safeSearch=moderate&maxResults=" +
    encodeURIComponent(String(max)) +
    "&q=" +
    encodeURIComponent(q) +
    "&key=" +
    encodeURIComponent(key);

  try {
    const res = await fetch(url);
    if (res.status === 403) return { ok: false, reason: "quota" };
    if (!res.ok) return { ok: false, reason: "network" };
    const data = (await res.json()) as {
      items?: {
        id?: { videoId?: string };
        snippet?: {
          title?: string;
          channelTitle?: string;
          thumbnails?: { medium?: { url?: string }; default?: { url?: string } };
        };
      }[];
    };
    const hits: YouTubeHit[] = (data.items ?? [])
      .map((it) => {
        const id = it.id?.videoId;
        if (!id) return null;
        const sn = it.snippet ?? {};
        return {
          id,
          title: decodeEntities(sn.title ?? id),
          channel: decodeEntities(sn.channelTitle ?? ""),
          thumb: sn.thumbnails?.medium?.url ?? sn.thumbnails?.default?.url ?? "",
        } as YouTubeHit;
      })
      .filter((h): h is YouTubeHit => !!h);
    return { ok: true, hits };
  } catch {
    return { ok: false, reason: "network" };
  }
}

/** YouTube отдаёт заголовки с HTML-сущностями (&amp; &#39;) — раскодируем. */
function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}
