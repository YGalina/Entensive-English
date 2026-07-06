import { View } from "react-native";
import { useMarina } from "@/theme";

// Бретонская полоска — фирменный декор «Марины» (как .stripe-breton на web).
// Вертикальные полосы 6px: белый/navy (или белый/красный).

export function Breton({ red = false, height = 8 }: { red?: boolean; height?: number }) {
  const { c } = useMarina();
  const tone = red ? c.accent : c.brand;
  return (
    <View
      style={{ height, flexDirection: "row", overflow: "hidden", borderRadius: 2 }}
      accessibilityElementsHidden
    >
      {Array.from({ length: 60 }, (_, i) => (
        <View
          key={i}
          style={{ width: 6, backgroundColor: i % 2 === 0 ? "#ffffff" : tone }}
        />
      ))}
    </View>
  );
}
