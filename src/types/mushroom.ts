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
  location: string;
};


