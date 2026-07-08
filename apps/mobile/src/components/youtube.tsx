// Нативный YouTube-плеер (iOS/Android): официальный IFrame API через
// react-native-youtube-iframe — корректно обрабатывает тап «play» в Expo Go
// и отдаёт текущее время (караоке-подсветка строк). Web-вариант —
// youtube.web.tsx (чистый <iframe>, время недоступно).

import { forwardRef, useImperativeHandle, useRef } from "react";
import { View } from "react-native";
import YoutubePlayer, { type YoutubeIframeRef } from "react-native-youtube-iframe";

export type YouTubeHandle = {
  /** Текущее время ролика в секундах (null — плеер не готов) */
  getCurrentTime: () => Promise<number | null>;
  /** Перемотка к секунде (тап по строке текста) */
  seekTo: (sec: number) => void;
};

export const YouTube = forwardRef<
  YouTubeHandle,
  { id: string; height: number; onStateChange?: (state: string) => void }
>(function YouTube({ id, height, onStateChange }, ref) {
    const player = useRef<YoutubeIframeRef | null>(null);

    useImperativeHandle(ref, () => ({
      getCurrentTime: async () => {
        try {
          const t = await player.current?.getCurrentTime();
          return typeof t === "number" && Number.isFinite(t) ? t : null;
        } catch {
          return null;
        }
      },
      seekTo: (sec) => {
        try {
          player.current?.seekTo(sec, true);
        } catch {}
      },
    }));

    return (
      <View style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "#000" }}>
        <YoutubePlayer
          ref={player}
          videoId={id}
          height={height}
          onChangeState={onStateChange}
          webViewProps={{ allowsInlineMediaPlayback: true }}
          initialPlayerParams={{ cc_lang_pref: "en", rel: false }}
        />
      </View>
    );
});
