"use client";

import { useEffect, useState } from "react";
import type { MushroomIdentification } from "../types/mushroom";
import { MushroomCard } from "../components/MushroomCard";
import { LocationDisplay } from "../components/LocationDisplay";
import { LocationPicker } from "../components/LocationPicker";
import { MapPin, X } from "lucide-react";

export default function Home() {
  const [mushrooms, setMushrooms] = useState<MushroomIdentification[]>([]);
  const [loading, setLoading] = useState(true);
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [selectedMapLocation, setSelectedMapLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);

  useEffect(() => {
    async function fetchMushrooms() {
      try {
        const response = await fetch("/api/mushrooms");
        const data = await response.json();
        setMushrooms(data);
      } catch (error) {
        console.error("Error fetching mushrooms:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchMushrooms();
  }, []);

  const filteredMushrooms = selectedLocation 
    ? mushrooms.filter((m) => m.location === selectedLocation)
    : mushrooms;

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
        {loading ? (
          <section className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-10 text-center text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">Loading field notes...</p>
          </section>
        ) : mushrooms.length === 0 ? (
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
          <div className="space-y-8">
            {/* Location Display Section */}
            <section className="mt-6">
              <LocationDisplay 
                mushrooms={mushrooms} 
                selectedLocation={selectedLocation}
                onLocationSelect={setSelectedLocation}
              />
            </section>

            {/* Location Picker Section */}
            <section className="rounded-2xl border border-neutral-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-emerald-600" />
                  <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-700">
                    Explore Locations on Map
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => setShowLocationPicker(!showLocationPicker)}
                  className="rounded-lg border border-neutral-300 bg-white px-4 py-2 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
                >
                  {showLocationPicker ? "Hide Map" : "Show Map"}
                </button>
              </div>

              {showLocationPicker && (
                <div className="mt-4">
                  <LocationPicker
                    onLocationSelect={(location) => {
                      setSelectedMapLocation(location);
                      console.log("Selected location:", location);
                    }}
                  />
                  {selectedMapLocation && (
                    <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/30 p-4">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-semibold uppercase tracking-wide text-emerald-900">
                            Selected Location
                          </p>
                          <p className="mt-1 text-sm text-emerald-800">{selectedMapLocation.address}</p>
                          <p className="mt-1 text-xs text-emerald-600">
                            Coordinates: {selectedMapLocation.lat.toFixed(6)}, {selectedMapLocation.lng.toFixed(6)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedMapLocation(null)}
                          className="rounded p-1 text-emerald-600 hover:bg-emerald-100"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </section>

            {/* Mushroom Gallery Section */}
            <section className="mt-6 space-y-4">
              <div className="flex items-baseline justify-between gap-2">
                <h2 className="text-xs font-semibold uppercase tracking-[0.28em] text-neutral-600">
                  FIELD ENTRIES
                </h2>
                <p className="text-xs text-neutral-600">
                  {filteredMushrooms.length}{" "}
                  {filteredMushrooms.length === 1 ? "observation" : "observations"} documented.
                </p>
              </div>
              <div className="grid gap-5 card-grid">
                {filteredMushrooms.map((mushroom) => (
                  <MushroomCard key={mushroom.imageFile} mushroom={mushroom} />
                ))}
              </div>
            </section>
          </div>
        )}
      </main>
    </div>
  );
}
