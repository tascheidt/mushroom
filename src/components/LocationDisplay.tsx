"use client";

import { MapPin, Filter } from "lucide-react";
import { useState, useMemo } from "react";
import type { MushroomIdentification } from "../types/mushroom";

type LocationDisplayProps = {
  mushrooms: MushroomIdentification[];
  selectedLocation?: string | null;
  onLocationSelect?: (location: string | null) => void;
};

export function LocationDisplay({ mushrooms, selectedLocation: externalSelectedLocation, onLocationSelect }: LocationDisplayProps) {
  const [internalSelectedLocation, setInternalSelectedLocation] = useState<string | null>(null);
  const selectedLocation = externalSelectedLocation !== undefined ? externalSelectedLocation : internalSelectedLocation;
  const setSelectedLocation = onLocationSelect || setInternalSelectedLocation;

  // Extract unique locations
  const uniqueLocations = useMemo(() => {
    const locations = new Set(mushrooms.map((m) => m.location));
    return Array.from(locations).sort();
  }, [mushrooms]);

  // Filter mushrooms by selected location
  const filteredMushrooms = useMemo(() => {
    if (!selectedLocation) return mushrooms;
    return mushrooms.filter((m) => m.location === selectedLocation);
  }, [mushrooms, selectedLocation]);

  // Group mushrooms by location
  const mushroomsByLocation = useMemo(() => {
    const grouped = new Map<string, MushroomIdentification[]>();
    mushrooms.forEach((m) => {
      const existing = grouped.get(m.location) || [];
      grouped.set(m.location, [...existing, m]);
    });
    return Array.from(grouped.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [mushrooms]);

  if (mushrooms.length === 0) return null;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-emerald-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-700">
            Collection Locations
          </h2>
        </div>
        {uniqueLocations.length > 1 && (
          <button
            type="button"
            onClick={() => setSelectedLocation(selectedLocation ? null : uniqueLocations[0])}
            className="flex items-center gap-1.5 rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-xs font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            <Filter className="h-3.5 w-3.5" />
            {selectedLocation ? "Show All" : "Filter"}
          </button>
        )}
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {mushroomsByLocation.map(([location, locationMushrooms]) => {
          const isSelected = selectedLocation === location;
          const isFiltered = selectedLocation !== null && !isSelected;

          return (
            <button
              key={location}
              type="button"
              onClick={() => setSelectedLocation(isSelected ? null : location)}
              className={`group rounded-xl border p-4 text-left transition ${
                isSelected
                  ? "border-emerald-500 bg-emerald-50/50 shadow-sm"
                  : isFiltered
                  ? "border-neutral-200 bg-neutral-50/50 opacity-50"
                  : "border-neutral-200 bg-white hover:border-emerald-300 hover:shadow-sm"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin
                      className={`h-3.5 w-3.5 flex-shrink-0 ${
                        isSelected ? "text-emerald-600" : "text-neutral-400"
                      }`}
                    />
                    <p
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        isSelected ? "text-emerald-900" : "text-neutral-700"
                      }`}
                    >
                      {location.split(",")[0].trim()}
                    </p>
                  </div>
                  <p className="mt-1 line-clamp-2 text-xs text-neutral-600">{location}</p>
                  <p className="mt-2 text-xs font-medium text-neutral-500">
                    {locationMushrooms.length}{" "}
                    {locationMushrooms.length === 1 ? "observation" : "observations"}
                  </p>
                </div>
                {isSelected && (
                  <div className="rounded-full bg-emerald-500 px-2 py-0.5 text-[0.65rem] font-semibold text-white">
                    Active
                  </div>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {selectedLocation && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50/30 px-4 py-2 text-xs text-emerald-800">
          <p>
            Showing <strong>{filteredMushrooms.length}</strong> observation
            {filteredMushrooms.length !== 1 ? "s" : ""} from{" "}
            <strong>{selectedLocation}</strong>
          </p>
        </div>
      )}
    </div>
  );
}

