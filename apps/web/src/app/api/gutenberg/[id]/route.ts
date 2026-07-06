import {
  chunkGutenbergText,
  gutenbergBookById,
  gutenbergTextCandidates,
} from "@/data/gutenberg";

export const revalidate = 86400;

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const book = gutenbergBookById(id);

  if (!book) {
    return Response.json({ error: "Unknown public-domain book" }, { status: 404 });
  }

  const text = await fetchFirstAvailableText(book.gutenbergId);
  if (!text) {
    return Response.json({ error: "Could not load text from Project Gutenberg" }, { status: 502 });
  }

  const chunks = chunkGutenbergText(book, text);
  if (chunks.length === 0) {
    return Response.json({ error: "No readable fragments found in Gutenberg text" }, { status: 422 });
  }

  return Response.json({ book, chunks });
}

async function fetchFirstAvailableText(gutenbergId: number): Promise<string | null> {
  for (const url of gutenbergTextCandidates(gutenbergId)) {
    try {
      const res = await fetch(url, {
        cache: "force-cache",
        next: { revalidate: 604800 },
      });
      if (!res.ok) continue;
      const text = await res.text();
      if (text.includes("Project Gutenberg") || text.length > 10_000) return text;
    } catch {}
  }

  return null;
}
