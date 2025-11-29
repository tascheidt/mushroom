"use client";

import { useState, useCallback, useRef } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import type { MushroomIdentification } from "../types/mushroom";
import { MapPin } from "lucide-react";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "500px",
};

type ObservationMapProps = {
  observations: MushroomIdentification[];
  onMarkerClick?: (observation: MushroomIdentification) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
};

export function ObservationMap({
  observations,
  onMarkerClick,
  center,
  zoom = 10,
}: ObservationMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  const onMapLoad = useCallback((mapInstance: google.maps.Map) => {
    mapRef.current = mapInstance;
    setMap(mapInstance);
  }, []);

  // Calculate center from observations if not provided
  const mapCenter = center || (() => {
    const observationsWithLocation = observations.filter(
      (obs) => obs.locationData?.lat && obs.locationData?.lng
    );
    if (observationsWithLocation.length === 0) {
      return { lat: 45.5152, lng: -122.6784 }; // Default to Portland
    }
    const avgLat =
      observationsWithLocation.reduce(
        (sum, obs) => sum + (obs.locationData?.lat || 0),
        0
      ) / observationsWithLocation.length;
    const avgLng =
      observationsWithLocation.reduce(
        (sum, obs) => sum + (obs.locationData?.lng || 0),
        0
      ) / observationsWithLocation.length;
    return { lat: avgLat, lng: avgLng };
  })();

  if (loadError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p className="font-semibold">Error loading Google Maps</p>
        <p className="mt-1">Please check your API key configuration.</p>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center rounded-xl border border-neutral-200 bg-neutral-50 p-8">
        <p className="text-sm text-neutral-600">Loading map...</p>
      </div>
    );
  }

  const observationsWithLocation = observations.filter(
    (obs) => obs.locationData?.lat && obs.locationData?.lng
  );

  return (
    <div className="overflow-hidden rounded-xl border border-neutral-200">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={mapCenter}
        zoom={zoom}
        onLoad={onMapLoad}
        options={{
          disableDefaultUI: false,
          zoomControl: true,
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: true,
        }}
      >
        {observationsWithLocation.map((observation, index) => (
          <Marker
            key={observation.imageFile || index}
            position={{
              lat: observation.locationData!.lat,
              lng: observation.locationData!.lng,
            }}
            title={observation.commonName || observation.scientificName}
            onClick={() => onMarkerClick?.(observation)}
            icon={{
              url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                  <circle cx="16" cy="16" r="12" fill="#10b981" stroke="white" stroke-width="2"/>
                  <text x="16" y="20" font-size="12" fill="white" text-anchor="middle" font-weight="bold">🍄</text>
                </svg>
              `),
              scaledSize: new google.maps.Size(32, 32),
            }}
          />
        ))}
      </GoogleMap>
      {observationsWithLocation.length > 0 && (
        <div className="border-t border-neutral-200 bg-white px-4 py-3">
          <p className="text-xs text-neutral-600">
            <MapPin className="mr-1.5 inline h-3.5 w-3.5 text-emerald-600" />
            Showing {observationsWithLocation.length} observation
            {observationsWithLocation.length !== 1 ? "s" : ""} on map
          </p>
        </div>
      )}
    </div>
  );
}

