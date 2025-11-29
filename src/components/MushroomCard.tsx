import Image from "next/image";
import type { MushroomIdentification } from "../types/mushroom";
import { Leaf, MapPin, AlertTriangle } from "lucide-react";

type Props = {
  mushroom: MushroomIdentification;
  onClick?: () => void;
};

export function MushroomCard({ mushroom, onClick }: Props) {
  const confidenceLabel =
    mushroom.confidence >= 85
      ? "High confidence"
      : mushroom.confidence >= 60
      ? "Medium confidence"
      : "Low confidence";

  const confidenceColor =
    mushroom.confidence >= 85
      ? "bg-emerald-100 text-emerald-800"
      : mushroom.confidence >= 60
      ? "bg-amber-100 text-amber-800"
      : "bg-rose-100 text-rose-800";

  const edibilityColor =
    mushroom.edibility === "Edible"
      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
      : mushroom.edibility === "Edible with Caution"
      ? "bg-amber-50 text-amber-700 border-amber-200"
      : mushroom.edibility === "Unknown"
      ? "bg-slate-50 text-slate-700 border-slate-200"
      : mushroom.edibility === "Psychoactive"
      ? "bg-purple-50 text-purple-700 border-purple-200"
      : "bg-rose-50 text-rose-700 border-rose-200";

  return (
    <button
      type="button"
      onClick={onClick}
      className="group flex flex-col overflow-hidden rounded-2xl border border-emerald-100 bg-neutral-50 text-left shadow-sm transition hover:-translate-y-1 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/70"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-neutral-200">
        <Image
          src={`/images/${mushroom.imageFile}`}
          alt={mushroom.commonName || mushroom.scientificName || "Mushroom"}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent p-4 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100/90">
            Field Note
          </p>
          <h3 className="mt-1 text-base font-semibold">
            {mushroom.commonName || "Unknown mushroom"}
          </h3>
          {mushroom.scientificName && (
            <p className="text-xs italic text-emerald-100/90">{mushroom.scientificName}</p>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-center justify-between gap-2">
          <span
            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${confidenceColor}`}
          >
            <Leaf className="mr-1.5 h-3.5 w-3.5" aria-hidden="true" />
            {confidenceLabel} · {mushroom.confidence}%
          </span>
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[0.7rem] font-semibold uppercase tracking-wide ${edibilityColor}`}
          >
            {mushroom.edibility}
          </span>
        </div>

        <div className="flex items-start gap-2 text-xs text-neutral-700">
          <MapPin className="mt-[2px] h-3.5 w-3.5 text-emerald-500" aria-hidden="true" />
          <p className="line-clamp-2">{mushroom.location}</p>
        </div>

        <dl className="mt-1 grid grid-cols-2 gap-3 border-t border-dashed border-neutral-200 pt-3 text-[0.72rem] text-neutral-700">
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Cap
            </dt>
            <dd className="mt-1 line-clamp-3">{mushroom.keyFeatures.cap}</dd>
          </div>
          <div>
            <dt className="font-semibold uppercase tracking-[0.18em] text-neutral-500">
              Gills / pores
            </dt>
            <dd className="mt-1 line-clamp-3">{mushroom.keyFeatures.gillsOrPores}</dd>
          </div>
        </dl>

        <div className="mt-auto flex items-center gap-2 border-t border-dashed border-neutral-200 pt-3 text-[0.72rem] text-neutral-600">
          <AlertTriangle className="h-3.5 w-3.5 text-amber-500" aria-hidden="true" />
          <p className="line-clamp-2">
            Never eat wild mushrooms based solely on AI identification. Always confirm with
            an expert.
          </p>
        </div>
      </div>
    </button>
  );
}


