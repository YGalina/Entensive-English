import { SoonScreen } from "@/components/soon-screen";
import { useMarina } from "@/theme";

export default function ListenScreen() {
  const { sk } = useMarina();
  return (
    <SoonScreen
      icon="headset"
      tone={sk.video}
      title="Слушать"
      lead="Shadowing — повторяй вслух за носителем. Декодирование беглой речи, просодия и мышцы лица работают вместе."
      points={[
        "Видео с носителями — имитация ритма и интонации",
        "«3-минутка»: дыхание → две фразы → аффирмация, где угодно",
        "Слушание в дороге — вход по Крашену без экрана",
        "Тихий период уважается: сначала вход, речь придёт сама",
      ]}
    />
  );
}
