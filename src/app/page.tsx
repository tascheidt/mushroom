import fs from "fs";
import path from "path";
import Image from "next/image";
import type { MushroomIdentification } from "../types/mushroom";
import { MushroomCard } from "../components/MushroomCard";

function loadMushroomData(): MushroomIdentification[] {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "mushrooms.json");
    if (!fs.existsSync(filePath)) return [];
    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as MushroomIdentification[];
    return parsed;
  } catch {
    return [];
  }
}

export default function Home() {
  const mushrooms = loadMushroomData();

  return (
    <div className="min-h-screen">
      <header className="border-b border-emerald-100/70 bg-gradient-to-b from-emerald-50/60 via-emerald-50/10 to-transparent/0 px-6 py-5 sm:px-10 sm:py-7">
        <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700/80">
              FIELD NOTE ATLAS
            </p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              Mushroom Field Notes
            </h1>
            <p className="mt-2 max-w-xl text-sm text-neutral-700">
              A locally generated field guide built from your own photographs, enriched with
              identifications from Gemini 3. Never forage based solely on this tool — always
              confirm with a human expert.
            </p>
          </div>
          <div className="rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-xs text-emerald-900 shadow-sm">
            <p className="font-semibold uppercase tracking-[0.24em] text-emerald-800">
              HOW TO UPDATE
            </p>
            <p className="mt-1">
              Add new photos to <code className="rounded bg-emerald-900/5 px-1.5 py-0.5">
                public/images
              </code>{" "}
              then run{" "}
              <code className="rounded bg-emerald-900/5 px-1.5 py-0.5">npm run analyze</code>{" "}
              to refresh this guide.
            </p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12 pt-6 sm:px-10 sm:pt-8">
        {mushrooms.length === 0 ? (
          <section className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-10 text-center text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">No identifications yet.</p>
            <p className="mt-2">
              Place your mushroom photos into{" "}
              <code className="rounded bg-white px-1.5 py-0.5">public/images</code>, then run{" "}
              <code className="rounded bg-white px-1.5 py-0.5">npm run analyze</code> in the{" "}
              <code className="rounded bg-white px-1.5 py-0.5">web</code> directory.
            </p>
          </section>
        ) : (
          <section className="mt-6 space-y-4">
            <div className="flex items-baseline justify-between gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-600">
                FIELD ENTRIES
              </h2>
              <p className="text-xs text-neutral-600">
                {mushrooms.length}{" "}
                {mushrooms.length === 1 ? "observation" : "observations"} documented.
              </p>
            </div>
            <div className="grid gap-5 card-grid">
              {mushrooms.map((mushroom) => (
                <MushroomCard
                  key={mushroom.imageFile}
                  mushroom={mushroom}
                />
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
