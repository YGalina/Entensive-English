// Библиотека книг. Два режима по правам:
// - "pd" (public domain): можно читать/скачать легально (ссылка на Project Gutenberg).
// - "protected": под защитой авторских прав — НЕ зашиваем текст; даём ссылку и
//   возможность «принести свою копию» (загрузка появится позже).
// Подбор под вкусы Галины: фэнтези и английский юмор.

export type Book = {
  id: string;
  title: string;
  author: string;
  genre: "fantasy" | "humor" | "classic" | "growth";
  /** Ориентир уровня */
  level: "a2" | "b1" | "b2" | "c1";
  kind: "pd" | "protected";
  /** Ссылка: Gutenberg (pd) или поиск (protected) */
  url: string;
};

const G = (id: number) => `https://www.gutenberg.org/ebooks/${id}`;
const Q = (q: string) => `https://www.goodreads.com/search?q=${encodeURIComponent(q)}`;

export const LIBRARY: Book[] = [
  // ——— Public domain (читаются легально) ———
  { id: "alice", title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", genre: "fantasy", level: "b1", kind: "pd", url: G(11) },
  { id: "looking-glass", title: "Through the Looking-Glass", author: "Lewis Carroll", genre: "fantasy", level: "b1", kind: "pd", url: G(12) },
  { id: "oz", title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", genre: "fantasy", level: "a2", kind: "pd", url: G(55) },
  { id: "willows", title: "The Wind in the Willows", author: "Kenneth Grahame", genre: "fantasy", level: "b2", kind: "pd", url: G(289) },
  { id: "peter-pan", title: "Peter Pan", author: "J. M. Barrie", genre: "fantasy", level: "b1", kind: "pd", url: G(16) },
  { id: "happy-prince", title: "The Happy Prince and Other Tales", author: "Oscar Wilde", genre: "fantasy", level: "b1", kind: "pd", url: G(902) },
  { id: "grimm", title: "Grimms' Fairy Tales", author: "Brothers Grimm", genre: "fantasy", level: "a2", kind: "pd", url: G(2591) },
  { id: "three-men", title: "Three Men in a Boat", author: "Jerome K. Jerome", genre: "humor", level: "b2", kind: "pd", url: G(308) },

  // ——— Под защитой авторских прав (ссылка + «своя копия») ———
  { id: "hobbit", title: "The Hobbit", author: "J. R. R. Tolkien", genre: "fantasy", level: "b2", kind: "protected", url: Q("The Hobbit Tolkien") },
  { id: "lotr", title: "The Lord of the Rings", author: "J. R. R. Tolkien", genre: "fantasy", level: "c1", kind: "protected", url: Q("The Lord of the Rings Tolkien") },
  { id: "narnia", title: "The Chronicles of Narnia", author: "C. S. Lewis", genre: "fantasy", level: "b1", kind: "protected", url: Q("The Chronicles of Narnia Lewis") },
  { id: "wot", title: "The Wheel of Time (series)", author: "Robert Jordan", genre: "fantasy", level: "c1", kind: "protected", url: Q("The Wheel of Time Robert Jordan") },
  { id: "little-prince", title: "The Little Prince", author: "Antoine de Saint-Exupéry", genre: "classic", level: "a2", kind: "protected", url: Q("The Little Prince Saint-Exupery English") },
  { id: "bridget", title: "Bridget Jones's Diary", author: "Helen Fielding", genre: "humor", level: "b2", kind: "protected", url: Q("Bridget Jones's Diary Fielding") },
];

export function booksByKind(kind: "pd" | "protected"): Book[] {
  return LIBRARY.filter((b) => b.kind === kind);
}
