# Знак внутри приложения · React Native

`mix-blend-mode` в RN нет, поэтому маркер кладётся **под** буквы полупрозрачной амберной плашкой — визуально это тот же хайлайтер поверх текста.

```tsx
import { Text, View } from "react-native";

export function IeMark({ size = 40 }: { size?: number }) {
  const pad = size * 0.26;
  return (
    <View style={{ alignSelf: "flex-start", paddingHorizontal: pad * 0.5 }}>
      <View
        pointerEvents="none"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: size * 0.14,
          bottom: size * 0.12,
          backgroundColor: "#FFD66B",
          borderTopLeftRadius: size * 0.22,
          borderTopRightRadius: size * 0.34,
          borderBottomRightRadius: size * 0.16,
          borderBottomLeftRadius: size * 0.28,
          transform: [{ rotate: "-1.5deg" }, { skewX: "-8deg" }],
        }}
      />
      <Text
        style={{
          fontFamily: "Lora_500Medium_Italic",
          fontSize: size,
          lineHeight: size * 1.06,
          color: "#22201B",
        }}
      >
        ie
      </Text>
    </View>
  );
}

export function IeLockup({ size = 30 }: { size?: number }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: size * 0.46 }}>
      <IeMark size={size} />
      <Text
        style={{
          fontFamily: "GolosText_700Bold",
          fontSize: size * 0.7,
          letterSpacing: -0.4,
          color: "#22201B",
        }}
      >
        Intensive English
      </Text>
    </View>
  );
}
```

Требуются загруженные шрифты `Lora_500Medium_Italic` и `GolosText_700Bold`. Минимальные размеры: `IeMark` 16, `IeLockup` 24. Ниже 32 маркер не рисуется — вместо знака амберная плитка с «ie» без штриха.
