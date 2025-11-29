"use client";

import { useState, useEffect } from "react";
import { LocationPicker } from "./LocationPicker";
import { DateTimePicker } from "./DateTimePicker";
import { WeatherDisplay } from "./WeatherDisplay";
import type { LocationData, WeatherData, MushroomIdentification } from "../types/mushroom";
import { MapPin, Calendar, Cloud, Save, Loader2 } from "lucide-react";

type ObservationFormProps = {
  imageFile: string;
  initialData?: Partial<MushroomIdentification>;
  onSave: (observation: MushroomIdentification) => Promise<void>;
  onCancel?: () => void;
};

export function ObservationForm({
  imageFile,
  initialData,
  onSave,
  onCancel,
}: ObservationFormProps) {
  const [location, setLocation] = useState<LocationData | null>(
    initialData?.locationData || null
  );
  const [dateTime, setDateTime] = useState<{ date: Date; time: Date }>({
    date: initialData?.observationDate
      ? new Date(initialData.observationDate)
      : new Date(),
    time: initialData?.observationTime
      ? new Date(initialData.observationTime)
      : new Date(),
  });
  const [weather, setWeather] = useState<WeatherData | null>(
    initialData?.weather || null
  );
  const [loadingWeather, setLoadingWeather] = useState(false);
  const [saving, setSaving] = useState(false);

  // Fetch weather when location and date are set
  useEffect(() => {
    if (location && dateTime.date && dateTime.time) {
      fetchWeather();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location?.lat, location?.lng, dateTime.date, dateTime.time]);

  async function fetchWeather() {
    if (!location) return;

    setLoadingWeather(true);
    try {
      const combinedDateTime = new Date(dateTime.date);
      combinedDateTime.setHours(dateTime.time.getHours());
      combinedDateTime.setMinutes(dateTime.time.getMinutes());

      const response = await fetch(
        `/api/weather?lat=${location.lat}&lng=${location.lng}&date=${combinedDateTime.toISOString()}`
      );

      if (response.ok) {
        const data = await response.json();
        setWeather(data);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error("Weather API error:", errorData);
      }
    } catch (error) {
      console.error("Error fetching weather:", error);
    } finally {
      setLoadingWeather(false);
    }
  }

  async function handleSave() {
    if (!location) {
      alert("Please select a location");
      return;
    }

    setSaving(true);
    try {
      const combinedDateTime = new Date(dateTime.date);
      combinedDateTime.setHours(dateTime.time.getHours());
      combinedDateTime.setMinutes(dateTime.time.getMinutes());

      const observation: MushroomIdentification = {
        ...(initialData as MushroomIdentification),
        imageFile,
        locationData: location,
        location: location.formattedLocation || location.address,
        observationDate: dateTime.date.toISOString().split("T")[0],
        observationTime: combinedDateTime.toISOString(),
        weather: weather || undefined,
      };

      await onSave(observation);
    } catch (error) {
      console.error("Error saving observation:", error);
      alert("Failed to save observation");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="h-5 w-5 text-emerald-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-700">
            Select Location
          </h2>
        </div>
        <LocationPicker
          onLocationSelect={(loc) => {
            setLocation({
              address: loc.address,
              lat: loc.lat,
              lng: loc.lng,
              formattedLocation: loc.address,
            });
          }}
          initialLocation={location?.address}
        />
        {location && (
          <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50/30 p-3">
            <p className="text-xs font-semibold text-emerald-900">Selected Location</p>
            <p className="mt-1 text-sm text-emerald-800">{location.address}</p>
          </div>
        )}
      </div>

      <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-emerald-600" />
          <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-700">
            Observation Date & Time
          </h2>
        </div>
        <DateTimePicker value={dateTime} onChange={setDateTime} />
      </div>

      {loadingWeather && (
        <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-neutral-400" />
          <p className="ml-2 text-sm text-neutral-600">Loading weather data...</p>
        </div>
      )}

      {weather && !loadingWeather && (
        <div className="rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            <Cloud className="h-5 w-5 text-blue-600" />
            <h2 className="text-sm font-semibold uppercase tracking-[0.28em] text-neutral-700">
              Weather Conditions
            </h2>
          </div>
          <WeatherDisplay weather={weather} />
        </div>
      )}

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleSave}
          disabled={!location || saving}
          className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:bg-neutral-300 disabled:text-neutral-500"
        >
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            <>
              <Save className="h-4 w-4" />
              Save Observation
            </>
          )}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-neutral-300 bg-white px-4 py-3 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
  );
}

