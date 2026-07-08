import { test, beforeEach } from "node:test";
import assert from "node:assert/strict";
import { configureStorage, memoryStorage } from "../storage";
import {
  parseYoutubeId,
  parseGutenbergId,
  titleFromGutenbergRaw,
  addMyVideo,
  removeMyVideo,
  addMyBook,
  setMyBookTitle,
} from "../mylibrary";
import { storage } from "../storage";

beforeEach(() => configureStorage(memoryStorage()));

function lib() {
  return JSON.parse(storage().getItem("ie_my_library") ?? "null");
}

test("parseYoutubeId: все формы ссылок и голый id", () => {
  const id = "dQw4w9WgXcQ";
  for (const u of [
    id,
    `https://youtu.be/${id}`,
    `https://www.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/watch?list=PL123&v=${id}&t=42`,
    `https://youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
  ]) {
    assert.equal(parseYoutubeId(u), id, u);
  }
  assert.equal(parseYoutubeId("https://vimeo.com/12345"), null);
  assert.equal(parseYoutubeId("просто текст"), null);
});

test("parseGutenbergId: ebooks/files/cache и голое число", () => {
  for (const u of [
    "1342",
    "https://www.gutenberg.org/ebooks/1342",
    "https://www.gutenberg.org/files/1342/1342-0.txt",
    "https://www.gutenberg.org/cache/epub/1342/pg1342.txt",
  ]) {
    assert.equal(parseGutenbergId(u), 1342, u);
  }
  assert.equal(parseGutenbergId("https://example.com/book/1342"), null);
});

test("titleFromGutenbergRaw: берёт Title из шапки", () => {
  const raw = "The Project Gutenberg eBook\nTitle: Pride and Prejudice\nAuthor: Jane Austen\n";
  assert.equal(titleFromGutenbergRaw(raw), "Pride and Prejudice");
  assert.equal(titleFromGutenbergRaw("no header here"), null);
});

test("видео: добавление без дублей, удаление", () => {
  addMyVideo("dQw4w9WgXcQ", "Never Gonna");
  addMyVideo("dQw4w9WgXcQ", "Дубль");
  assert.equal(lib().videos.length, 1);
  assert.equal(lib().videos[0].title, "Never Gonna");
  removeMyVideo("dQw4w9WgXcQ");
  assert.equal(lib().videos.length, 0);
});

test("книги: добавление и дозаполнение заголовка", () => {
  addMyBook(1342, "Gutenberg #1342");
  setMyBookTitle(1342, "Pride and Prejudice");
  assert.equal(lib().books[0].title, "Pride and Prejudice");
});
