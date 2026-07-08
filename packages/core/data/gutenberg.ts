import type { Book } from "./library";
import type { ReadingPara, Story } from "./reading";

type GutenbergGenre = Extract<Book["genre"], Story["genre"]>;

export type GutenbergBook = {
  bookId: Book["id"];
  gutenbergId: number;
  title: string;
  author: string;
  level: Book["level"];
  genre: GutenbergGenre;
  /** Интересы-смыслы (id из catalog.INTERESTS) — для полки и подбора под вкусы. */
  interests: string[];
};

export type GutenbergChunk = {
  id: string;
  index: number;
  title: string;
  author: string;
  level: GutenbergBook["level"];
  genre: GutenbergBook["genre"];
  sourceUrl: string;
  wordCount: number;
  paras: string[];
};

export type GutenbergResponse = {
  book: GutenbergBook;
  chunks: GutenbergChunk[];
};

export const GUTENBERG_BOOKS: GutenbergBook[] = [
  // ——— Сказки и красивые истории ———
  { bookId: "alice", gutenbergId: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", level: "b1", genre: "fantasy", interests: ["stories"] },
  { bookId: "looking-glass", gutenbergId: 12, title: "Through the Looking-Glass", author: "Lewis Carroll", level: "b1", genre: "fantasy", interests: ["stories"] },
  { bookId: "oz", gutenbergId: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", level: "a2", genre: "fantasy", interests: ["stories", "parenting"] },
  { bookId: "willows", gutenbergId: 289, title: "The Wind in the Willows", author: "Kenneth Grahame", level: "b2", genre: "fantasy", interests: ["stories", "parenting"] },
  { bookId: "peter-pan", gutenbergId: 16, title: "Peter Pan", author: "J. M. Barrie", level: "b1", genre: "fantasy", interests: ["stories", "parenting"] },
  { bookId: "happy-prince", gutenbergId: 902, title: "The Happy Prince and Other Tales", author: "Oscar Wilde", level: "b1", genre: "fantasy", interests: ["stories", "spirit"] },
  { bookId: "grimm", gutenbergId: 2591, title: "Grimms' Fairy Tales", author: "Brothers Grimm", level: "a2", genre: "fantasy", interests: ["stories", "parenting"] },
  { bookId: "andersen", gutenbergId: 1597, title: "Andersen's Fairy Tales", author: "Hans Christian Andersen", level: "a2", genre: "fantasy", interests: ["stories", "parenting"] },
  // ——— Английский юмор ———
  { bookId: "three-men", gutenbergId: 308, title: "Three Men in a Boat", author: "Jerome K. Jerome", level: "b2", genre: "humor", interests: ["humor", "travel"] },
  { bookId: "tom-sawyer", gutenbergId: 74, title: "The Adventures of Tom Sawyer", author: "Mark Twain", level: "b1", genre: "humor", interests: ["humor", "stories"] },
  // ——— Люди и отношения ———
  { bookId: "pride", gutenbergId: 1342, title: "Pride and Prejudice", author: "Jane Austen", level: "b2", genre: "classic", interests: ["people", "stories"] },
  { bookId: "emma", gutenbergId: 158, title: "Emma", author: "Jane Austen", level: "b2", genre: "classic", interests: ["people"] },
  // ——— Путешествия ———
  { bookId: "around-world", gutenbergId: 103, title: "Around the World in Eighty Days", author: "Jules Verne", level: "b1", genre: "classic", interests: ["travel", "stories"] },
  // ——— Духовный рост и мышление ———
  { bookId: "meditations", gutenbergId: 2680, title: "Meditations", author: "Marcus Aurelius", level: "c1", genre: "classic", interests: ["spirit", "psychology"] },
  // ——— Расширение библиотеки (фидбэк «маленькая») ———
  { bookId: "secret-garden", gutenbergId: 113, title: "The Secret Garden", author: "Frances Hodgson Burnett", level: "b1", genre: "classic", interests: ["stories", "parenting", "garden"] },
  { bookId: "little-princess", gutenbergId: 146, title: "A Little Princess", author: "Frances Hodgson Burnett", level: "b1", genre: "classic", interests: ["stories", "parenting"] },
  { bookId: "anne-green-gables", gutenbergId: 45, title: "Anne of Green Gables", author: "L. M. Montgomery", level: "b1", genre: "classic", interests: ["stories", "parenting", "people"] },
  { bookId: "little-women", gutenbergId: 514, title: "Little Women", author: "Louisa May Alcott", level: "b1", genre: "classic", interests: ["people", "parenting"] },
  { bookId: "jane-eyre", gutenbergId: 1260, title: "Jane Eyre", author: "Charlotte Brontë", level: "b2", genre: "classic", interests: ["people", "stories"] },
  { bookId: "wuthering", gutenbergId: 768, title: "Wuthering Heights", author: "Emily Brontë", level: "c1", genre: "classic", interests: ["people"] },
  { bookId: "sherlock", gutenbergId: 1661, title: "The Adventures of Sherlock Holmes", author: "Arthur Conan Doyle", level: "b2", genre: "classic", interests: ["stories", "psychology"] },
  { bookId: "dorian-gray", gutenbergId: 174, title: "The Picture of Dorian Gray", author: "Oscar Wilde", level: "c1", genre: "classic", interests: ["culture", "people"] },
  { bookId: "treasure-island", gutenbergId: 120, title: "Treasure Island", author: "Robert Louis Stevenson", level: "b1", genre: "classic", interests: ["stories", "travel"] },
  { bookId: "huck-finn", gutenbergId: 76, title: "Adventures of Huckleberry Finn", author: "Mark Twain", level: "b2", genre: "humor", interests: ["humor", "travel"] },
  { bookId: "frankenstein", gutenbergId: 84, title: "Frankenstein", author: "Mary Shelley", level: "b2", genre: "classic", interests: ["stories", "science"] },
  { bookId: "jekyll-hyde", gutenbergId: 43, title: "The Strange Case of Dr Jekyll and Mr Hyde", author: "Robert Louis Stevenson", level: "b2", genre: "classic", interests: ["psychology", "stories"] },
];

export function gutenbergBookById(bookId: string): GutenbergBook | undefined {
  return GUTENBERG_BOOKS.find((b) => b.bookId === bookId);
}

const LEVEL_ORDER = ["a1", "a2", "b1", "b2", "c1", "c2"];

/**
 * Книги для читалки, отсортированные под ученицу: совпадение интересов важнее,
 * затем близость к её уровню. Полный список (ничего не прячем) — просто порядок.
 */
export function booksForReader(interests: string[], level?: string): GutenbergBook[] {
  const want = new Set(interests);
  const li = level ? LEVEL_ORDER.indexOf(level.toLowerCase()) : -1;
  return [...GUTENBERG_BOOKS]
    .map((b) => {
      const match = b.interests.filter((i) => want.has(i)).length;
      const near = li >= 0 ? -Math.abs(LEVEL_ORDER.indexOf(b.level) - li) : 0;
      return { b, score: match * 10 + near };
    })
    .sort((a, z) => z.score - a.score)
    .map((x) => x.b);
}

export function gutenbergPageUrl(gutenbergId: number): string {
  return `https://www.gutenberg.org/ebooks/${gutenbergId}`;
}

export function gutenbergTextCandidates(gutenbergId: number): string[] {
  return [
    `https://www.gutenberg.org/cache/epub/${gutenbergId}/pg${gutenbergId}.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}-0.txt`,
    `https://www.gutenberg.org/files/${gutenbergId}/${gutenbergId}.txt`,
  ];
}

export function stripGutenbergBoilerplate(raw: string): string {
  const lines = raw.replace(/\r\n/g, "\n").replace(/\r/g, "\n").split("\n");
  const start = lines.findIndex((line) =>
    /\*\*\*\s*START OF (THE|THIS) PROJECT GUTENBERG EBOOK/i.test(line)
  );
  const end = lines.findIndex((line) =>
    /\*\*\*\s*END OF (THE|THIS) PROJECT GUTENBERG EBOOK/i.test(line)
  );
  const body = lines.slice(start >= 0 ? start + 1 : 0, end >= 0 ? end : lines.length);
  return body.join("\n");
}

export function wordsInText(text: string): number {
  const words = text.match(/[A-Za-z]+(?:[-'][A-Za-z]+)*/g);
  return words?.length ?? 0;
}

function isLikelyBodyParagraph(para: string): boolean {
  const words = wordsInText(para);
  if (words < 18) return false;
  if (/^\[?(illustration|transcriber|note|contents|chapter|volume)\b/i.test(para)) return false;
  if (/project gutenberg|gutenberg|copyright|ebook|license|www\./i.test(para)) return false;
  if (para.length < 80) return false;

  const letters = para.replace(/[^A-Za-z]/g, "");
  const upper = para.replace(/[^A-Z]/g, "");
  if (letters.length > 0 && upper.length / letters.length > 0.78 && words < 80) return false;

  return true;
}

export function cleanGutenbergParagraphs(raw: string): string[] {
  return stripGutenbergBoilerplate(raw)
    .split(/\n{2,}/)
    .map((para) => para.replace(/\s*\n\s*/g, " ").replace(/\s{2,}/g, " ").trim())
    .filter(isLikelyBodyParagraph);
}

function chunkTargets(level: GutenbergBook["level"]): { min: number; max: number } {
  if (level === "a2") return { min: 140, max: 230 };
  if (level === "b1") return { min: 180, max: 300 };
  if (level === "b2") return { min: 220, max: 380 };
  return { min: 260, max: 450 };
}

export function chunkGutenbergText(
  book: GutenbergBook,
  raw: string,
  maxChunks = 10
): GutenbergChunk[] {
  const sourceUrl = gutenbergPageUrl(book.gutenbergId);
  const targets = chunkTargets(book.level);
  const chunks: GutenbergChunk[] = [];
  let paras: string[] = [];
  let total = 0;

  for (const para of cleanGutenbergParagraphs(raw)) {
    const count = wordsInText(para);
    if (paras.length > 0 && total + count > targets.max) {
      chunks.push(makeChunk(book, chunks.length + 1, sourceUrl, paras, total));
      paras = [];
      total = 0;
      if (chunks.length >= maxChunks) break;
    }

    paras.push(para);
    total += count;

    if (total >= targets.min) {
      chunks.push(makeChunk(book, chunks.length + 1, sourceUrl, paras, total));
      paras = [];
      total = 0;
      if (chunks.length >= maxChunks) break;
    }
  }

  if (chunks.length < maxChunks && paras.length > 0 && total >= 80) {
    chunks.push(makeChunk(book, chunks.length + 1, sourceUrl, paras, total));
  }

  return chunks;
}

export function gutenbergChunkToStory(chunk: GutenbergChunk): Story {
  const paras: ReadingPara[] = chunk.paras.map((en) => ({ en }));
  return {
    id: chunk.id,
    title: `${chunk.title}: фрагмент ${chunk.index}`,
    author: chunk.author,
    level: chunk.level,
    genre: chunk.genre,
    excerpt: true,
    fullUrl: chunk.sourceUrl,
    paras,
  };
}

function makeChunk(
  book: GutenbergBook,
  index: number,
  sourceUrl: string,
  paras: string[],
  wordCount: number
): GutenbergChunk {
  return {
    id: `gutenberg-${book.bookId}-${index}`,
    index,
    title: book.title,
    author: book.author,
    level: book.level,
    genre: book.genre,
    sourceUrl,
    wordCount,
    paras,
  };
}
