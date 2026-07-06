import { SoonScreen } from "@/components/soon-screen";
import { useMarina } from "@/theme";

export default function SoundsScreen() {
  const { sk } = useMarina();
  return (
    <SoonScreen
      icon="mic"
      tone={sk.sounds}
      title="Звуки"
      lead="Постановка произношения по Шестову: не отдельные звуки, а живая фраза, которая проходит лестницу темпа."
      points={[
        "Слушай → сверхмедленно по словам → вместе → как носитель",
        "Фразы из корпуса Шестова, минимум три круга",
        "Артикуляция = мышечная память лица и рта",
        "Правила чтения 26 букв — справочник под рукой",
      ]}
    />
  );
}
