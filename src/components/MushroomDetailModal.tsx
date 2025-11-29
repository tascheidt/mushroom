"use client";

import { X, MapPin, Calendar, Cloud, Leaf, AlertTriangle, Book, ChefHat, Sprout } from "lucide-react";
import Image from "next/image";
import type { MushroomIdentification } from "../types/mushroom";
import { useEffect } from "react";

type MushroomDetailModalProps = {
  mushroom: MushroomIdentification;
  onClose: () => void;
};

export function MushroomDetailModal({ mushroom, onClose }: MushroomDetailModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };
    
    window.addEventListener("keydown", handleEscape);
    // Prevent body scroll when modal is open
    document.body.style.overflow = "hidden";
    
    return () => {
      window.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [onClose]);

  const confidenceColor =
    mushroom.confidence >= 85
      ? "text-emerald-700 bg-emerald-50"
      : mushroom.confidence >= 60
      ? "text-amber-700 bg-amber-50"
      : "text-rose-700 bg-rose-50";

  const edibilityColor =
    mushroom.edibility === "Edible"
      ? "bg-emerald-100 text-emerald-900 border-emerald-300"
      : mushroom.edibility === "Edible with Caution"
      ? "bg-amber-100 text-amber-900 border-amber-300"
      : mushroom.edibility === "Unknown"
      ? "bg-slate-100 text-slate-900 border-slate-300"
      : mushroom.edibility === "Psychoactive"
      ? "bg-purple-100 text-purple-900 border-purple-300"
      : "bg-rose-100 text-rose-900 border-rose-300";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative max-h-[90vh] w-full max-w-6xl overflow-y-auto rounded-2xl bg-[#f5f1e8] shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with close button */}
        <div className="sticky top-0 z-10 flex items-start justify-between border-b border-neutral-300 bg-gradient-to-b from-emerald-50/90 to-transparent p-6 backdrop-blur-sm">
          <div className="flex-1 pr-8">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-emerald-700/80">
              Field Note Details
            </p>
            <h2 className="mt-1 text-3xl font-semibold tracking-tight text-neutral-900">
              {mushroom.commonName}
            </h2>
            <p className="mt-1 text-lg italic text-neutral-600">{mushroom.scientificName}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-neutral-600 transition hover:bg-neutral-200 hover:text-neutral-900"
            aria-label="Close modal"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Top section: Images side by side */}
          <div className="mb-8 grid gap-6 md:grid-cols-2">
            {/* Original Photo */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-600">
                Original Photo
              </h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 shadow-md">
                <Image
                  src={`/images/${mushroom.imageFile}`}
                  alt={mushroom.commonName}
                  fill
                  className="object-cover"
                />
              </div>
            </div>

            {/* Info Card */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-600">
                Field Guide Card
              </h3>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-neutral-300 bg-neutral-200 shadow-md">
                {mushroom.infoCardImage ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={`data:image/png;base64,${mushroom.infoCardImage}`}
                    alt={`Info card for ${mushroom.commonName}`}
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-neutral-500">
                    <p className="text-sm">No info card available</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Metadata Section */}
          <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {/* Confidence */}
            <div className={`rounded-xl border p-4 ${confidenceColor}`}>
              <div className="flex items-center gap-2">
                <Leaf className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Confidence</span>
              </div>
              <p className="mt-2 text-2xl font-bold">{mushroom.confidence}%</p>
            </div>

            {/* Edibility */}
            <div className={`rounded-xl border-2 p-4 ${edibilityColor}`}>
              <div className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Edibility</span>
              </div>
              <p className="mt-2 text-xl font-bold">{mushroom.edibility}</p>
            </div>

            {/* Ecological Role */}
            <div className="rounded-xl border border-neutral-300 bg-white p-4">
              <div className="flex items-center gap-2 text-neutral-700">
                <Sprout className="h-5 w-5" />
                <span className="text-sm font-semibold uppercase tracking-wider">Role</span>
              </div>
              <p className="mt-2 text-xl font-semibold text-neutral-900">
                {mushroom.ecologicalRole}
              </p>
            </div>
          </div>

          {/* Location & Time Section */}
          <div className="mb-8 space-y-4">
            {mushroom.locationData && (
              <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <MapPin className="mt-1 h-5 w-5 flex-shrink-0 text-emerald-600" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-600">
                      Location
                    </h3>
                    <p className="mt-2 text-neutral-900">
                      {mushroom.locationData.address || mushroom.location}
                    </p>
                    {mushroom.locationData.lat && mushroom.locationData.lng && (
                      <p className="mt-1 text-sm text-neutral-600">
                        Coordinates: {mushroom.locationData.lat.toFixed(6)},{" "}
                        {mushroom.locationData.lng.toFixed(6)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {mushroom.observationDate && (
              <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-600">
                      Observation Date
                    </h3>
                    <p className="mt-2 text-neutral-900">
                      {new Date(mushroom.observationDate).toLocaleDateString("en-US", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                      {mushroom.observationTime &&
                        ` at ${new Date(mushroom.observationTime).toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}`}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {mushroom.weather && (
              <div className="rounded-xl border border-blue-300 bg-blue-50/50 p-5 shadow-sm">
                <div className="flex items-start gap-3">
                  <Cloud className="mt-1 h-5 w-5 flex-shrink-0 text-blue-600" />
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-blue-900">
                      Weather Conditions
                    </h3>
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      <div>
                        <p className="text-xs text-blue-700">Temperature</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {mushroom.weather.temperature.toFixed(1)}°C
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Condition</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {mushroom.weather.condition}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Humidity</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {mushroom.weather.humidity}%
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-blue-700">Wind Speed</p>
                        <p className="text-lg font-semibold text-blue-900">
                          {mushroom.weather.windSpeed} km/h
                        </p>
                      </div>
                    </div>
                    {mushroom.weather.description && (
                      <p className="mt-3 text-sm text-blue-800">{mushroom.weather.description}</p>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Safety Warning */}
          {mushroom.warning && (
            <div className="mb-8 rounded-xl border-2 border-rose-300 bg-rose-50 p-5 shadow-sm">
              <div className="flex items-start gap-3">
                <AlertTriangle className="mt-1 h-5 w-5 flex-shrink-0 text-rose-700" />
                <div className="flex-1">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.28em] text-rose-900">
                    Safety Warning
                  </h3>
                  <p className="mt-2 text-rose-900">{mushroom.warning}</p>
                </div>
              </div>
            </div>
          )}

          {/* Key Features */}
          <div className="mb-8 rounded-xl border border-neutral-300 bg-white p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.28em] text-neutral-600">
              <Book className="h-5 w-5" />
              Key Identification Features
            </h3>
            <dl className="grid gap-4 sm:grid-cols-2">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Cap
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">{mushroom.keyFeatures.cap}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Gills / Pores
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">
                  {mushroom.keyFeatures.gillsOrPores}
                </dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Stipe (Stem)
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">{mushroom.keyFeatures.stipe}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                  Spore Print Color
                </dt>
                <dd className="mt-1 text-sm text-neutral-900">
                  {mushroom.keyFeatures.sporePrintColor}
                </dd>
              </div>
              {mushroom.keyFeatures.other && (
                <div className="sm:col-span-2">
                  <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-neutral-500">
                    Other Features
                  </dt>
                  <dd className="mt-1 text-sm text-neutral-900">{mushroom.keyFeatures.other}</dd>
                </div>
              )}
            </dl>
          </div>

          {/* Habitat & Ecology */}
          <div className="mb-8 grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-neutral-600">
                Habitat Notes
              </h3>
              <p className="text-sm leading-relaxed text-neutral-900">{mushroom.habitatNotes}</p>
            </div>

            <div className="rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-neutral-600">
                Fun Fact
              </h3>
              <p className="text-sm leading-relaxed text-neutral-900">{mushroom.funFact}</p>
            </div>
          </div>

          {/* Cooking & Usage */}
          {mushroom.cookingOrUsage && (
            <div className="mb-8 rounded-xl border border-neutral-300 bg-white p-5 shadow-sm">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-[0.28em] text-neutral-600">
                Cooking & Usage Notes
              </h3>
              <p className="text-sm leading-relaxed text-neutral-900">{mushroom.cookingOrUsage}</p>
            </div>
          )}

          {/* Footer disclaimer */}
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-center">
            <p className="text-xs text-amber-900">
              This identification is AI-assisted and should not be used as the sole basis for
              determining edibility. Always consult with a qualified mycologist before consuming
              wild mushrooms.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

