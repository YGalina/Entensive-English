# Конфиг Expo

Заменить PNG в `apps/mobile/assets/images/` файлами из `icons/` этого пакета (имена совпадают), затем проверить конфиг:

```json
{
  "expo": {
    "icon": "./assets/images/icon.png",
    "backgroundColor": "#FAF6EE",
    "splash": {
      "image": "./assets/images/splash-icon.png",
      "resizeMode": "contain",
      "backgroundColor": "#FAF6EE"
    },
    "android": {
      "adaptiveIcon": {
        "foregroundImage": "./assets/images/android-icon-foreground.png",
        "backgroundImage": "./assets/images/android-icon-background.png",
        "monochromeImage": "./assets/images/android-icon-monochrome.png",
        "backgroundColor": "#FAF6EE"
      }
    },
    "web": { "favicon": "./assets/images/favicon.png", "themeColor": "#E8623D" }
  }
}
```

Статус-бар и тема: `themeColor` — терракота `#E8623D`; фон приложения — бумага `#FAF6EE`, в режиме лампы `#211D16`.

Старые `assets/icons/icon-full.svg`, `icon-emblem.svg`, `icon-mono.svg` (коралловый пузырь с бирюзовой волной) удалить — они не относятся к фирменному стилю.
