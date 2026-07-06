// Metro для монорепо. Две задачи:
// 1) видеть общие пакеты из корня воркспейса (@ie/core|tokens|media);
// 2) НЕ допустить второй копии React. Веб держит react 19.2.4 в корневом
//    node_modules, мобильный — 19.1.0 в своём. Общий @ie/core по умолчанию
//    поднимается за react в корень и хватает 19.2.4 → «Invalid hook call».
//    Поэтому react/react-native резолвим из node_modules приложения.
const { getDefaultConfig } = require("expo/metro-config");
const path = require("path");

const projectRoot = __dirname;
const workspaceRoot = path.resolve(projectRoot, "../..");

const config = getDefaultConfig(projectRoot);

// Следим за корнем воркспейса — иначе Metro не увидит symlink'и @ie/*.
config.watchFolders = [workspaceRoot];

// Единственный экземпляр React/RN: подменяем origin на файл внутри приложения,
// чтобы стандартный резолвер Metro нашёл именно apps/mobile/node_modules/<pkg>
// (и для react/jsx-runtime, react/compiler-runtime — они начинаются с "react/").
// Иерархический поиск НЕ отключаем — иначе ломается резолв вложенных зависимостей.
const SINGLETON = /^(react|react-native)(\/.*)?$/;
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (SINGLETON.test(moduleName)) {
    return context.resolveRequest(
      { ...context, originModulePath: path.join(projectRoot, "index.js") },
      moduleName,
      platform
    );
  }
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
