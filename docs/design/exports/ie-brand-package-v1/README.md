# Intensive English · фирменный стиль · пакет v1

Всё, что нужно, чтобы фирменный стиль оказался в приложении: знак, иконки, палитра, шрифты, правила.

## Состав

```
ie-brand-package-v1/
├── BRAND.md                     ← правила и как применять (главный файл)
├── BRAND_SHEET.html             ← визуальный лист, открывается офлайн
├── tokens.json                  ← палитра, флаги навыков, радиусы, шрифты
├── tokens.css                   ← :root и .dark с теми же значениями
├── icons/
│   ├── icon.png                 1024 · iOS, web
│   ├── android-icon-background.png   1024 · плоская бумага
│   ├── android-icon-foreground.png   1024 · знак, прозрачный фон
│   ├── android-icon-monochrome.png   1024 · «ie» без маркера, прозрачный
│   ├── splash-icon.png          1024 · сплэш
│   ├── favicon.png              192 · амберная плитка
│   ├── ie-mark.svg              вектор знака
│   └── ie-lockup.svg            вектор знака с названием
└── snippets/
    ├── app.json.md              что вписать в конфиг Expo
    └── IeMark.tsx.md            знак внутри приложения на React Native
```

## Важно про текущие иконки в репозитории

`apps/mobile/assets/icons/icon-full.svg`, `icon-emblem.svg`, `icon-mono.svg` — коралловый квадрат `#f26a54` с речевым пузырём и бирюзовой волной `#147e86`. Ни один из этих цветов не входит в палитру, знака «ie» с маркером там нет. Файлы из этого пакета заменяют их полностью, вместе с PNG в `apps/mobile/assets/images/`.

Палитра в `packages/tokens/index.ts` уже верная — `tokens.json` здесь её зеркало, а не замена.
