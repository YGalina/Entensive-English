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
  { bookId: "alice", gutenbergId: 11, title: "Alice's Adventures in Wonderland", author: "Lewis Carroll", level: "b1", genre: "fantasy" },
  { bookId: "looking-glass", gutenbergId: 12, title: "Through the Looking-Glass", author: "Lewis Carroll", level: "b1", genre: "fantasy" },
  { bookId: "oz", gutenbergId: 55, title: "The Wonderful Wizard of Oz", author: "L. Frank Baum", level: "a2", genre: "fantasy" },
  { bookId: "willows", gutenbergId: 289, title: "The Wind in the Willows", author: "Kenneth Grahame", level: "b2", genre: "fantasy" },
  { bookId: "peter-pan", gutenbergId: 16, title: "Peter Pan", author: "J. M. Barrie", level: "b1", genre: "fantasy" },
  { bookId: "happy-prince", gutenbergId: 902, title: "The Happy Prince and Other Tales", author: "Oscar Wilde", level: "b1", genre: "fantasy" },
  { bookId: "grimm", gutenbergId: 2591, title: "Grimms' Fairy Tales", author: "Brothers Grimm", level: "a2", genre: "fantasy" },
  { bookId: "three-men", gutenbergId: 308, title: "Three Men in a Boat", author: "Jerome K. Jerome", level: "b2", genre: "humor" },
];

export function gutenbergBookById(bookId: string): GutenbergBook | undefined {
  return GUTENBERG_BOOKS.find((b) => b.bookId === bookId);
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
