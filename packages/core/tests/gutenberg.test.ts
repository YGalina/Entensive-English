import { test } from "node:test";
import assert from "node:assert/strict";
import {
  stripGutenbergBoilerplate,
  cleanGutenbergParagraphs,
  chunkGutenbergText,
  gutenbergChunkToStory,
  booksForReader,
  wordsInText,
  type GutenbergBook,
} from "../data/gutenberg";

const P1 =
  "The morning light fell softly across the quiet harbour as the little boat drifted out to sea. " +
  "She watched the water move and felt the wind touch her face, and for a moment nothing else in the whole wide world seemed to matter at all to her.";
const P2 =
  "Far away on the distant shore a bell was ringing slowly, calling the fishermen home. " +
  "The birds turned in the pale sky above the waves, and the old man on the pier lifted his hand to wave at the passing sail with a slow and gentle smile.";
const P3 =
  "By evening the sea had grown calm and dark, and the first small stars appeared. " +
  "The girl leaned back against the wooden hull and closed her eyes, listening to the endless quiet rhythm of the water as it carried her softly onward through the night.";

const RAW =
  "The Project Gutenberg eBook of Test Book\nAuthor: Nobody\n\n" +
  "*** START OF THE PROJECT GUTENBERG EBOOK TEST BOOK ***\n\n" +
  P1 + "\n\n" + P2 + "\n\n" + P3 + "\n\n" +
  "*** END OF THE PROJECT GUTENBERG EBOOK TEST BOOK ***\n\n" +
  "This eBook is for the use of anyone... www.gutenberg.org license text here.";

const BOOK: GutenbergBook = {
  bookId: "test",
  gutenbergId: 999999,
  title: "Test Book",
  author: "Nobody",
  level: "a2",
  genre: "classic",
  interests: ["stories"],
};

test("strip boilerplate: тело между START/END, без лицензии и шапки", () => {
  const body = stripGutenbergBoilerplate(RAW);
  assert.ok(body.includes("morning light"), "тело сохранено");
  assert.ok(!body.includes("START OF THE PROJECT"), "маркер начала убран");
  assert.ok(!body.includes("license text"), "футер/лицензия убраны");
});

test("cleanParagraphs: только живые абзацы (мусор/служебное отброшено)", () => {
  const paras = cleanGutenbergParagraphs(RAW);
  assert.equal(paras.length, 3);
  assert.ok(paras.every((p) => wordsInText(p) >= 18));
  assert.ok(paras.every((p) => !/gutenberg|license/i.test(p)));
});

test("chunkGutenbergText: главы собираются, слова считаются, id по книге", () => {
  const chunks = chunkGutenbergText(BOOK, RAW);
  assert.ok(chunks.length >= 1, "хотя бы одна глава");
  const totalWords = chunks.reduce((a, ch) => a + ch.wordCount, 0);
  assert.ok(totalWords > 100, "слова посчитаны");
  assert.ok(chunks[0].id.startsWith("gutenberg-test-"), "id привязан к книге");
  assert.equal(chunks[0].sourceUrl, "https://www.gutenberg.org/ebooks/999999");
});

test("chunk → Story: пригодна для читалки (paras без ru, excerpt=true)", () => {
  const story = gutenbergChunkToStory(chunkGutenbergText(BOOK, RAW)[0]);
  assert.equal(story.excerpt, true);
  assert.ok(story.paras.length >= 1);
  assert.ok(story.paras.every((p) => typeof p.en === "string" && p.ru === undefined));
  assert.equal(story.level, "a2");
});

test("booksForReader: совпадение интересов поднимает книгу выше", () => {
  const people = booksForReader(["people"]);
  assert.ok(["pride", "emma"].includes(people[0].bookId), "Остин — вверху для «люди»");

  const humor = booksForReader(["humor"]);
  assert.ok(["three-men", "tom-sawyer"].includes(humor[0].bookId), "юмор — вверху для «юмор»");

  // Полный список не теряется — просто переупорядочен.
  assert.equal(booksForReader([]).length, booksForReader(["people"]).length);
});
