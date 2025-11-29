import type { MushroomIdentification } from "@/types/mushroom";

export async function fetchImages(): Promise<string[]> {
  const response = await fetch("/api/images");
  if (!response.ok) {
    throw new Error("Failed to fetch images");
  }
  return response.json();
}

export async function analyzeImage(imageFile: string): Promise<MushroomIdentification> {
  const response = await fetch("/api/analyze", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageFile }),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to analyze image" }));
    throw new Error(error.error || "Failed to analyze image");
  }

  return response.json();
}

export async function saveObservation(observation: MushroomIdentification): Promise<MushroomIdentification> {
  const response = await fetch("/api/mushrooms", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(observation),
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: "Failed to save observation" }));
    throw new Error(error.error || "Failed to save observation");
  }

  const result = await response.json();
  return result.observation || observation;
}

export async function fetchMushrooms(): Promise<MushroomIdentification[]> {
  const response = await fetch("/api/mushrooms");
  if (!response.ok) {
    throw new Error("Failed to fetch mushrooms");
  }
  return response.json();
}

