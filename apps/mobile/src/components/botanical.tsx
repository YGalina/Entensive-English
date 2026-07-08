// Ботанический декор «Марины» — ветви, листья, бабочки (дух Gucci florals,
// палитра «Морской волны»). Рисуется react-native-svg: без ассетов, работает
// в обеих темах. Деликатно: декор живёт по углам, герой экрана — в центре.
// Бабочка мягко «дышит» (покачивание), уважая reduce motion.

import { useEffect, useRef, useState } from "react";
import { AccessibilityInfo, Animated, View, useWindowDimensions } from "react-native";
import Svg, { Circle, Ellipse, G, Path } from "react-native-svg";
import { useMarina } from "@/theme";

function useReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    let alive = true;
    AccessibilityInfo.isReduceMotionEnabled?.()
      .then((v) => {
        if (alive) setReduced(!!v);
      })
      .catch(() => {});
    const sub = AccessibilityInfo.addEventListener?.("reduceMotionChanged", (v) => setReduced(!!v));
    return () => {
      alive = false;
      sub?.remove?.();
    };
  }, []);
  return reduced;
}

/** Ветвь с листьями и ягодами. Кривые нарисованы под viewBox 0 0 160 160. */
function Branch({ leaf, berry, flip = false }: { leaf: string; berry: string; flip?: boolean }) {
  return (
    <G transform={flip ? "scale(-1,1) translate(-160,0)" : undefined}>
      <Path
        d="M8,152 C30,120 38,86 66,60 C84,44 104,34 128,28"
        stroke={leaf}
        strokeWidth={2.4}
        fill="none"
        strokeLinecap="round"
        opacity={0.55}
      />
      <Path d="M26,124 C42,116 52,118 62,128" stroke={leaf} strokeWidth={2} fill="none" strokeLinecap="round" opacity={0.45} />
      {/* Листья — ланцетные, парами вдоль стебля */}
      <Ellipse cx={34} cy={106} rx={16} ry={6.5} fill={leaf} opacity={0.5} transform="rotate(-38 34 106)" />
      <Ellipse cx={22} cy={128} rx={13} ry={5.5} fill={leaf} opacity={0.38} transform="rotate(-58 22 128)" />
      <Ellipse cx={58} cy={78} rx={17} ry={7} fill={leaf} opacity={0.55} transform="rotate(-30 58 78)" />
      <Ellipse cx={82} cy={54} rx={15} ry={6} fill={leaf} opacity={0.45} transform="rotate(-22 82 54)" />
      <Ellipse cx={74} cy={70} rx={12} ry={5} fill={leaf} opacity={0.32} transform="rotate(-64 74 70)" />
      <Ellipse cx={106} cy={40} rx={13} ry={5.5} fill={leaf} opacity={0.5} transform="rotate(-16 106 40)" />
      <Ellipse cx={124} cy={32} rx={10} ry={4.4} fill={leaf} opacity={0.36} transform="rotate(-10 124 32)" />
      {/* Ягоды-точки — латунь и коралл */}
      <Circle cx={46} cy={92} r={3.4} fill={berry} opacity={0.75} />
      <Circle cx={94} cy={46} r={2.8} fill={berry} opacity={0.65} />
      <Circle cx={64} cy={112} r={2.4} fill={berry} opacity={0.55} />
    </G>
  );
}

/** Пятилепестковый цветок (рисуется в точке cx,cy родного viewBox ветви). */
function Flower({ cx, cy, petal, heart, size = 7 }: { cx: number; cy: number; petal: string; heart: string; size?: number }) {
  const petals = Array.from({ length: 5 }, (_, i) => {
    const a = (i * 72 * Math.PI) / 180;
    return (
      <Ellipse
        key={i}
        cx={cx + Math.cos(a) * size * 0.9}
        cy={cy + Math.sin(a) * size * 0.9}
        rx={size * 0.75}
        ry={size * 0.45}
        fill={petal}
        opacity={0.75}
        transform={`rotate(${i * 72} ${cx + Math.cos(a) * size * 0.9} ${cy + Math.sin(a) * size * 0.9})`}
      />
    );
  });
  return (
    <G>
      {petals}
      <Circle cx={cx} cy={cy} r={size * 0.42} fill={heart} opacity={0.9} />
    </G>
  );
}

/** Одинокая тонкая веточка с парой листьев (viewBox 0 0 80 80). */
function Sprig({ leaf, tilt = 0 }: { leaf: string; tilt?: number }) {
  return (
    <G transform={`rotate(${tilt} 40 40)`}>
      <Path d="M40,72 C40,54 42,38 40,16" stroke={leaf} strokeWidth={1.8} fill="none" strokeLinecap="round" opacity={0.45} />
      <Ellipse cx={33} cy={46} rx={10} ry={4} fill={leaf} opacity={0.4} transform="rotate(-40 33 46)" />
      <Ellipse cx={47} cy={32} rx={9} ry={3.6} fill={leaf} opacity={0.34} transform="rotate(35 47 32)" />
    </G>
  );
}

/** Бабочка тонкой линии с коралловыми крыльями (viewBox 0 0 100 80). */
function Butterfly({ wing, body, dot }: { wing: string; body: string; dot: string }) {
  return (
    <Svg width={64} height={52} viewBox="0 0 100 80">
      <Path
        d="M50,42 C38,18 16,8 10,20 C4,32 22,48 46,48 Z"
        fill={wing}
        opacity={0.5}
        stroke={wing}
        strokeWidth={1.6}
      />
      <Path
        d="M50,42 C62,18 84,8 90,20 C96,32 78,48 54,48 Z"
        fill={wing}
        opacity={0.5}
        stroke={wing}
        strokeWidth={1.6}
      />
      <Path d="M48,46 C38,58 26,66 20,60 C14,54 28,46 46,48 Z" fill={wing} opacity={0.32} />
      <Path d="M52,46 C62,58 74,66 80,60 C86,54 72,46 54,48 Z" fill={wing} opacity={0.32} />
      <Path d="M50,36 C50,44 50,52 50,58" stroke={body} strokeWidth={3} strokeLinecap="round" />
      <Path d="M50,36 C46,30 42,26 38,24 M50,36 C54,30 58,26 62,24" stroke={body} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      <Circle cx={26} cy={28} r={2.6} fill={dot} opacity={0.8} />
      <Circle cx={74} cy={28} r={2.6} fill={dot} opacity={0.8} />
    </Svg>
  );
}

/**
 * Рамка настройки/ритуалов: ветви по нижним углам, бабочки в верхней трети.
 * pointerEvents="none" — декор никогда не мешает касаниям.
 */
export function BotanicalFrame() {
  const { c, sk } = useMarina();
  const { width, height } = useWindowDimensions();
  const reduced = useReducedMotion();

  const float = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    if (reduced) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(float, { toValue: 1, duration: 2600, useNativeDriver: true }),
        Animated.timing(float, { toValue: 0, duration: 2600, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [float, reduced]);

  const drift = float.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });
  const tilt = float.interpolate({ inputRange: [0, 1], outputRange: ["-3deg", "3deg"] });

  return (
    <View pointerEvents="none" style={{ position: "absolute", left: 0, top: 0, width, height }}>
      {/* Ветви: нижние углы */}
      <Svg width={170} height={170} viewBox="0 0 160 160" style={{ position: "absolute", left: -14, bottom: -10 }}>
        <Branch leaf={c.brand} berry={c.sun} />
        <Flower cx={52} cy={96} petal={c.accent} heart={c.sun} size={8} />
        <Flower cx={98} cy={44} petal={sk.reading} heart={c.sun} size={6} />
      </Svg>
      <Svg width={150} height={150} viewBox="0 0 160 160" style={{ position: "absolute", right: -16, bottom: -14 }}>
        <Branch leaf={c.brand} berry={c.accent} flip />
        <Flower cx={104} cy={90} petal={c.accent} heart={c.sun} size={7} />
      </Svg>
      {/* Одинокие веточки — воздух и живость в свободных местах */}
      <Svg width={70} height={70} viewBox="0 0 80 80" style={{ position: "absolute", left: 18, top: height * 0.40 }}>
        <Sprig leaf={c.brand} tilt={-18} />
      </Svg>
      <Svg width={60} height={60} viewBox="0 0 80 80" style={{ position: "absolute", right: 24, top: height * 0.55 }}>
        <Sprig leaf={c.brand} tilt={24} />
      </Svg>
      {/* Верхняя тонкая ветвь справа */}
      <Svg width={120} height={120} viewBox="0 0 160 160" style={{ position: "absolute", right: -22, top: 64, transform: [{ rotate: "160deg" }] }}>
        <Branch leaf={c.brand} berry={c.sun} />
      </Svg>
      {/* Бабочки */}
      <Animated.View style={{ position: "absolute", left: 26, top: height * 0.16, transform: [{ translateY: drift }, { rotate: tilt }] }}>
        <Butterfly wing={c.accent} body={c.brandD} dot={c.sun} />
      </Animated.View>
      <Animated.View
        style={{
          position: "absolute",
          right: 34,
          top: height * 0.30,
          transform: [{ translateY: Animated.multiply(drift, -0.7) }, { rotate: "14deg" }, { scale: 0.62 }],
        }}
      >
        <Butterfly wing={sk.reading} body={c.brandD} dot={c.accent} />
      </Animated.View>
    </View>
  );
}
