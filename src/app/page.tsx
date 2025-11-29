"use client";

import { useEffect, useState } from "react";
import type { MushroomIdentification } from "../types/mushroom";
import { MushroomCard } from "../components/MushroomCard";
import { LocationDisplay } from "../components/LocationDisplay";
import { ObservationMap } from "../components/ObservationMap";
import { MushroomDetailModal } from "../components/MushroomDetailModal";
import { Map } from "lucide-react";
import { analyzeImage, saveObservation } from "../utils/api";

export default function Home() {
  const [mushrooms, setMushrooms] = useState<MushroomIdentification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"gallery" | "map">("gallery");
  const [selectedMushroom, setSelectedMushroom] = useState<MushroomIdentification | null>(null);

  useEffect(() => {
    fetchMushrooms();
  }, []);

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

  async function handleReprocess(mushroom: MushroomIdentification) {
    if (!confirm(`Reprocess "${mushroom.commonName}"? This will re-analyze the image and update the observation.`)) {
      return;
    }

    try {
      // Re-analyze the image
      const analysisResult = await analyzeImage(mushroom.imageFile);
      
      // Merge with existing data (preserve location, date, weather if they exist)
      const updatedObservation: MushroomIdentification = {
        ...analysisResult,
        locationData: mushroom.locationData || analysisResult.locationData,
        location: mushroom.location || analysisResult.location || "Unknown",
        observationDate: mushroom.observationDate || analysisResult.observationDate,
        observationTime: mushroom.observationTime || analysisResult.observationTime,
        weather: mushroom.weather || analysisResult.weather,
      };

      // Save the updated observation
      await saveObservation(updatedObservation);

      // Update local state
      setMushrooms((prev) =>
        prev.map((m) =>
          m.imageFile === mushroom.imageFile ? updatedObservation : m
        )
      );
    } catch (error) {
      console.error("Error reprocessing mushroom:", error);
      alert("Failed to reprocess observation. Please try again.");
    }
  }

  const filteredMushrooms = selectedLocation
    ? mushrooms.filter((m) => {
        const locationKey = m.locationData?.formattedLocation || m.locationData?.address || m.location || "Unknown";
        return locationKey === selectedLocation;
      })
    : mushrooms;

  const observationsWithLocation = mushrooms.filter(
    (m) => m.locationData?.lat && m.locationData?.lng
  );

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
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 pb-12 pt-6 sm:px-10 sm:pt-8">
        {/* Tab Navigation */}
        <div className="mb-6 flex gap-2 border-b border-neutral-200">
          <button
            type="button"
            onClick={() => setActiveTab("gallery")}
            className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
              activeTab === "gallery"
                ? "border-emerald-600 text-emerald-900"
                : "border-transparent text-neutral-600 hover:text-neutral-900"
            }`}
          >
            Gallery ({mushrooms.length})
          </button>
          {observationsWithLocation.length > 0 && (
            <button
              type="button"
              onClick={() => setActiveTab("map")}
              className={`border-b-2 px-4 py-2 text-sm font-medium transition ${
                activeTab === "map"
                  ? "border-emerald-600 text-emerald-900"
                  : "border-transparent text-neutral-600 hover:text-neutral-900"
              }`}
            >
              <Map className="mr-1.5 inline h-4 w-4" />
              Map ({observationsWithLocation.length})
            </button>
          )}
        </div>

        {loading ? (
          <section className="mt-10 rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-10 text-center text-sm text-neutral-700">
            <p className="font-medium text-neutral-900">Loading field notes...</p>
          </section>
        ) : activeTab === "map" ? (
          <section className="mt-6">
            <ObservationMap
              observations={mushrooms}
              onMarkerClick={(obs) => {
                setSelectedLocation(obs.location);
                setActiveTab("gallery");
              }}
            />
          </section>
        ) : (
          <div className="space-y-8">
            {/* Location Display Section */}
            {mushrooms.length > 0 && (
              <section className="mt-6">
                <LocationDisplay
                  mushrooms={mushrooms}
                  selectedLocation={selectedLocation}
                  onLocationSelect={setSelectedLocation}
                />
              </section>
            )}

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
              {filteredMushrooms.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-neutral-300 bg-neutral-50/80 px-6 py-10 text-center text-sm text-neutral-700">
                  <p className="font-medium text-neutral-900">No observations found</p>
                  <p className="mt-2">
                    {selectedLocation
                      ? "Try selecting a different location or clear the filter."
                      : "Run 'npm run analyze' in the web directory to process images from the public/images folder."}
                  </p>
                </div>
              ) : (
                <div className="grid gap-5 card-grid">
                  {filteredMushrooms.map((mushroom) => (
                    <MushroomCard
                      key={mushroom.imageFile}
                      mushroom={mushroom}
                      onOpenDetail={() => setSelectedMushroom(mushroom)}
                      onReprocess={handleReprocess}
                    />
                  ))}
                </div>
              )}
            </section>
          </div>
        )}
      </main>

      {/* Mushroom Detail Modal */}
      {selectedMushroom && (
        <MushroomDetailModal
          mushroom={selectedMushroom}
          onClose={() => setSelectedMushroom(null)}
        />
      )}
    </div>
  );
}
