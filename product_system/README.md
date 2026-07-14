# product_system/ — перевод методологии в продукт

Слой между `learning_architecture/` (утверждённая методика) и реализацией. КОД ЗАМОРОЖЕН.
Массовую имплементацию не начинать; сперва — наименьший вертикальный срез (validation_experiments.md).

1. `product_learning_system_v1.md` — головной: 8 журналов обучения + 9 поверхностей продукта
2. `mobile_information_architecture_v1.md` — mobile IA (ритуал/голос/микро)
3. `web_information_architecture_v1.md` — web IA (+раздел «Мастерская», «Прогресс»)
4. `cross_platform_learning_flows.md` — 10 сквозных потоков объекта через систему
5. `learning_data_model.md` — LearningObject (направленный статус, миграция)
6. `progress_and_assessment_model.md` — метрики [изм]/[выв]/[эксп]
7. `legacy_migration_plan.md` — конфликты легаси↔методика (KEEP/REFACTOR/REMOVE/BUILD)
8. `implementation_roadmap_v1.md` — P0/P1/P2, дорожки, зависимости
9. `validation_experiments.md` — гипотезы + 🎯 наименьший вертикальный срез

Инварианты (нельзя нарушать): chunk-единица · извлечение смысл→форма в тот же день ·
нить fluency T4→T5 · вывод с ОС (тренер ПОСЛЕ, не перебивая) · аффект-гейт ·
6 дорожек не ярлык · без медитаций/стрика/«вала в подсознание» · Галина только лендинг/письма ·
mobile=ритуал/web=глубина · вовлечённость≠владение.
