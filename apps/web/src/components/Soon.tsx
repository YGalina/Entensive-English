import BottomNav from "./BottomNav";
import { Spark } from "./Icons";

export default function Soon({ title, note }: { title: string; note: string }) {
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col items-center justify-center px-6 text-center">
        <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Spark className="h-7 w-7" />
        </span>
        <h1 className="mt-4 font-heading text-xl font-extrabold text-ink">{title}</h1>
        <p className="mt-2 max-w-[280px] text-sm leading-relaxed text-muted">{note}</p>
      </main>
      <BottomNav />
    </div>
  );
}
