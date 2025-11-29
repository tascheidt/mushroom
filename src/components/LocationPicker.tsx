"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { GoogleMap, Marker, useJsApiLoader } from "@react-google-maps/api";
import { MapPin, Search } from "lucide-react";

const libraries: ("places")[] = ["places"];

const mapContainerStyle = {
  width: "100%",
  height: "400px",
};

const defaultCenter = {
  lat: 45.5152, // Portland, OR default
  lng: -122.6784,
};

type LocationPickerProps = {
  onLocationSelect: (location: {
    address: string;
    lat: number;
    lng: number;
  }) => void;
  initialLocation?: string;
};

export function LocationPicker({ onLocationSelect, initialLocation }: LocationPickerProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [selectedLocation, setSelectedLocation] = useState<{
    address: string;
    lat: number;
    lng: number;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "";
  
  const { isLoaded, loadError } = useJsApiLoader({
    id: "google-map-script",
    googleMapsApiKey: apiKey,
    libraries,
  });

  const onMapLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onMapClick = useCallback(
    (e: google.maps.MapMouseEvent) => {
      if (e.latLng) {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();

        // Reverse geocode to get address
        const geocoder = new google.maps.Geocoder();
        geocoder.geocode({ location: { lat, lng } }, (results, status) => {
          if (status === "OK" && results && results[0]) {
            const address = results[0].formatted_address;
            const location = { address, lat, lng };
            setSelectedLocation(location);
            onLocationSelect(location);
          } else {
            // Fallback to coordinates if geocoding fails
            const address = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
            const location = { address, lat, lng };
            setSelectedLocation(location);
            onLocationSelect(location);
          }
        });
      }
    },
    [onLocationSelect]
  );

  // Set up autocomplete when input ref and maps are loaded
  useEffect(() => {
    if (isLoaded && inputRef.current && !autocompleteRef.current) {
      const autocompleteInstance = new google.maps.places.Autocomplete(inputRef.current, {
        types: ["geocode", "establishment"],
      });
      
      autocompleteRef.current = autocompleteInstance;
      
      autocompleteInstance.addListener("place_changed", () => {
        const place = autocompleteInstance.getPlace();
        if (place.geometry && place.geometry.location) {
          const lat = place.geometry.location.lat();
          const lng = place.geometry.location.lng();
          const address = place.formatted_address || place.name || "";
          const location = { address, lat, lng };

          setSelectedLocation(location);
          setSearchQuery(address);
          onLocationSelect(location);

          // Center map on selected location
          if (map) {
            map.setCenter({ lat, lng });
            map.setZoom(15);
          }
        }
      });
    }

    // Cleanup
    return () => {
      if (autocompleteRef.current) {
        google.maps.event.clearInstanceListeners(autocompleteRef.current);
        autocompleteRef.current = null;
      }
    };
  }, [isLoaded, map, onLocationSelect]);

  if (!apiKey) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <p className="font-semibold">Google Maps API Key Required</p>
        <p className="mt-1">
          Please set <code className="rounded bg-amber-100 px-1.5 py-0.5">NEXT_PUBLIC_GOOGLE_MAPS_API_KEY</code> in your <code className="rounded bg-amber-100 px-1.5 py-0.5">.env.local</code> file.
        </p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-800">
        <p className="font-semibold">Error loading Google Maps</p>
        <p className="mt-1">Please check your API key configuration.</p>
        <p className="mt-1 text-xs">Error: {loadError.message || "Unknown error"}</p>
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

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
        <input
          ref={inputRef}
          type="text"
          placeholder="Search for a location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full rounded-lg border border-neutral-300 bg-white py-2.5 pl-10 pr-4 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
        />
      </div>

      <div className="overflow-hidden rounded-xl border border-neutral-200">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          center={selectedLocation ? { lat: selectedLocation.lat, lng: selectedLocation.lng } : defaultCenter}
          zoom={selectedLocation ? 15 : 10}
          onLoad={onMapLoad}
          onClick={onMapClick}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            streetViewControl: false,
            mapTypeControl: false,
            fullscreenControl: true,
          }}
        >
          {selectedLocation && (
            <Marker
              position={{ lat: selectedLocation.lat, lng: selectedLocation.lng }}
              animation={google.maps.Animation.DROP}
            />
          )}
        </GoogleMap>
      </div>

      {selectedLocation && (
        <div className="flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 text-sm">
          <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-emerald-600" />
          <div className="flex-1">
            <p className="font-medium text-emerald-900">Selected Location</p>
            <p className="mt-0.5 text-emerald-700">{selectedLocation.address}</p>
            <p className="mt-1 text-xs text-emerald-600">
              {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

