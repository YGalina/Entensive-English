import { test } from "node:test";
import assert from "node:assert/strict";
import { ROLE_SCENES, sceneById } from "../data/roleScenes";

test("сцены: ≥5 штук, id уникальны, у каждой обе роли и атрибуция PD", () => {
  assert.ok(ROLE_SCENES.length >= 5);
  assert.equal(new Set(ROLE_SCENES.map((s) => s.id)).size, ROLE_SCENES.length);
  for (const s of ROLE_SCENES) {
    assert.ok(s.roleA && s.roleB && s.roleA !== s.roleB, s.id);
    assert.match(s.source, /public domain/i, `${s.id}: атрибуция PD обязательна`);
    assert.ok(s.lines.length >= 5, s.id);
    // обе роли реально говорят — иначе «сыграть» нечего
    assert.ok(s.lines.some((l) => l.who === "a") && s.lines.some((l) => l.who === "b"), s.id);
    for (const l of s.lines) {
      assert.ok(l.en.trim() && l.ru.trim(), `${s.id}: реплика с en и ru`);
    }
  }
});

test("sceneById находит сцену", () => {
  assert.equal(sceneById("alice-cat")?.roleB, "Cheshire Cat");
  assert.equal(sceneById("nope"), undefined);
});
