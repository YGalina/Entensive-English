import { SoonScreen } from "@/components/soon-screen";
import { useMarina } from "@/theme";

export default function ReadScreen() {
  const { sk } = useMarina();
  return (
    <SoonScreen
      icon="book"
      tone={sk.reading}
      title="Читать"
      lead="Массив текста в удовольствие — не по слову, а потоком. Скорочтение с замером WPM и библиотека под твои интересы."
      points={[
        "Тексты и книги: классика, сказки, психология, английский юмор",
        "Замер скорости чтения — самый честный KPI метода",
        "Перевод по касанию, без выпадения из потока",
        "Оффлайн: читай в метро и в самолёте",
      ]}
    />
  );
}
