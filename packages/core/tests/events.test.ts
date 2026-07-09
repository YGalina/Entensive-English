import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import { emitEvent, pendingEvents, ackEvents, flushEvents, queueSize } from "../events";
import { recordAnswer } from "../srs";
import { addArtifact } from "../output";
import { addTime } from "../timelog";

beforeEach(() => configureStorage(memoryStorage()));

test("доменные записи порождают события: srs, artifact, time", () => {
  recordAnswer("health", "recover", true);
  addArtifact({ type: "status", text: "Today I practiced." });
  addTime("reading", 120);
  const types = pendingEvents().map((e) => e.type);
  assert.deepEqual(types, ["srs-answer", "artifact-created", "time-add"]);
});

test("приватность: событие артефакта не содержит текста", () => {
  addArtifact({ type: "status", text: "My private diary line." });
  const [e] = pendingEvents();
  assert.equal(JSON.stringify(e.payload).includes("private diary"), false);
  assert.equal(e.payload.type, "status");
});

test("flushEvents: отправляет батчами, чистит подтверждённое, ошибка сети не теряет очередь", async () => {
  for (let i = 0; i < 5; i++) emitEvent("time-add", { i });
  // сеть упала — очередь цела
  let sent = await flushEvents(async () => {
    throw new Error("offline");
  });
  assert.equal(sent, 0);
  assert.equal(queueSize(), 5);
  // сеть ожила — батчами по 2
  const batches: number[] = [];
  sent = await flushEvents(async (evts) => {
    batches.push(evts.length);
    return { ok: true };
  }, 2);
  assert.equal(sent, 5);
  assert.deepEqual(batches, [2, 2, 1]);
  assert.equal(queueSize(), 0);
});

test("ackEvents убирает только подтверждённые", () => {
  const a = emitEvent("x", {});
  const b = emitEvent("y", {});
  ackEvents([a.id]);
  assert.deepEqual(pendingEvents().map((e) => e.id), [b.id]);
});
