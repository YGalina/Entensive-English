// Web-вариант плеера (RN-web превью и веб-таргет): обычный <iframe>,
// без react-native-youtube-iframe — его web-ветка требует пакет
// react-native-web-webview, который не нужен и не установлен.

import { createElement } from "react";

export function YouTube({ id, height }: { id: string; height: number }) {
  return createElement("iframe", {
    src: `https://www.youtube.com/embed/${id}?playsinline=1&rel=0&cc_load_policy=1&cc_lang_pref=en`,
    style: { width: "100%", height, border: 0, borderRadius: 16 },
    allow: "autoplay; encrypted-media; picture-in-picture",
    allowFullScreen: true,
  });
}
