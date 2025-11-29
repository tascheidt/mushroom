"use client";

import type { WeatherData } from "../types/mushroom";
import { Cloud, Droplets, Wind, Thermometer } from "lucide-react";

type WeatherDisplayProps = {
  weather: WeatherData;
};

export function WeatherDisplay({ weather }: WeatherDisplayProps) {
  return (
    <div className="rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/50 to-blue-100/30 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Cloud className="h-4 w-4 text-blue-600" />
        <h3 className="text-xs font-semibold uppercase tracking-wide text-blue-900">
          Weather Conditions
        </h3>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div className="flex items-center gap-2">
          <Thermometer className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-700">Temperature</p>
            <p className="text-sm font-semibold text-blue-900">
              {weather.temperature.toFixed(1)}°C
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Droplets className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-700">Humidity</p>
            <p className="text-sm font-semibold text-blue-900">
              {weather.humidity}%
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Wind className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-700">Wind Speed</p>
            <p className="text-sm font-semibold text-blue-900">
              {weather.windSpeed.toFixed(1)} km/h
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Cloud className="h-4 w-4 text-blue-600" />
          <div>
            <p className="text-xs text-blue-700">Condition</p>
            <p className="text-sm font-semibold text-blue-900">
              {weather.condition}
            </p>
          </div>
        </div>
      </div>
      {weather.precipitation !== undefined && weather.precipitation > 0 && (
        <div className="mt-3 border-t border-blue-200 pt-3">
          <p className="text-xs text-blue-700">
            Precipitation: <strong>{weather.precipitation.toFixed(1)} mm</strong>
          </p>
        </div>
      )}
      <p className="mt-2 text-xs italic text-blue-600">{weather.description}</p>
    </div>
  );
}

