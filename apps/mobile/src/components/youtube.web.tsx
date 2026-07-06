// Web-вариант плеера (RN-web превью и веб-таргет): обычный <iframe>,
// без react-native-youtube-iframe — его web-ветка требует пакет
// react-native-web-webview, который не нужен и не установлен.
// Время/перемотка через простой iframe недоступны — караоке только на телефоне.

import { createElement, forwardRef, useImperativeHandle } from "react";
import type { YouTubeHandle } from "./youtube";

export type { YouTubeHandle } from "./youtube";

export const YouTube = forwardRef<YouTubeHandle, { id: string; height: number }>(
  function YouTube({ id, height }, ref) {
    useImperativeHandle(ref, () => ({
      getCurrentTime: async () => null,
      seekTo: () => {},
    }));
    return createElement("iframe", {
      src: `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&cc_load_policy=1&cc_lang_pref=en`,
      style: { width: "100%", height, border: 0, borderRadius: 16 },
      allow: "autoplay; encrypted-media; picture-in-picture",
      allowFullScreen: true,
    });
  }
);
