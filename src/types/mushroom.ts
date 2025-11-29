export type Edibility =
  | "Unknown"
  | "Edible"
  | "Edible with Caution"
  | "Inedible"
  | "Toxic"
  | "Psychoactive";

export type EcologicalRole = "Unknown" | "Saprotrophic" | "Mycorrhizal" | "Parasitic";

export type KeyFeatures = {
  cap: string;
  gillsOrPores: string;
  stipe: string;
  sporePrintColor: string;
  other: string;
};

export type LocationData = {
  address: string;
  lat: number;
  lng: number;
  formattedLocation?: string; // Human-readable location string
};

export type WeatherData = {
  temperature: number; // Celsius
  condition: string; // e.g., "Clear", "Rain", "Cloudy"
  humidity: number; // Percentage
  windSpeed: number; // km/h
  precipitation?: number; // mm
  description: string;
  icon?: string;
};

export type MushroomIdentification = {
  imageFile: string;
  scientificName: string;
  commonName: string;
  confidence: number;
  edibility: Edibility;
  warning: string;
  keyFeatures: KeyFeatures;
  ecologicalRole: EcologicalRole;
  habitatNotes: string;
  funFact: string;
  cookingOrUsage: string;
  location: string; // Legacy field, kept for backward compatibility
  locationData?: LocationData; // New structured location data
  observationDate?: string; // ISO 8601 date string
  observationTime?: string; // ISO 8601 time string
  weather?: WeatherData;
  infoCardImage?: string; // Base64 encoded info card image
};


