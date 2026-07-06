// Нативный YouTube-плеер (iOS/Android): официальный IFrame API через
// react-native-youtube-iframe — корректно обрабатывает тап «play» в Expo Go.
// Web-вариант — youtube.web.tsx (чистый <iframe>, без этой библиотеки).

import { View } from "react-native";
import YoutubePlayer from "react-native-youtube-iframe";

export function YouTube({ id, height }: { id: string; height: number }) {
  return (
    <View style={{ borderRadius: 16, overflow: "hidden", backgroundColor: "#000" }}>
      <YoutubePlayer
        videoId={id}
        height={height}
        webViewProps={{ allowsInlineMediaPlayback: true }}
        initialPlayerParams={{ cc_lang_pref: "en", rel: false }}
      />
    </View>
  );
}
