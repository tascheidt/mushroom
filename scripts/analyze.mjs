#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";
import exifr from "exifr";

dotenv.config({ path: path.resolve(process.cwd(), "..", ".env") });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const IMAGES_DIR = path.resolve(__dirname, "../public/images");
const OUTPUT_FILE = path.resolve(__dirname, "../src/data/mushrooms.json");

function requireEnv(name) {
  const value = process.env[name];
  if (!value) {
    console.error(`Missing required environment variable: ${name}`);
    process.exit(1);
  }
  return value;
}

// Location prompt removed - location will be set via UI

function loadImages() {
  if (!fs.existsSync(IMAGES_DIR)) {
    console.error(`Images directory not found: ${IMAGES_DIR}`);
    process.exit(1);
  }

  const files = fs
    .readdirSync(IMAGES_DIR)
    .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
    .sort();

  if (files.length === 0) {
    console.error(`No image files found in ${IMAGES_DIR}`);
    process.exit(1);
  }

  return files;
}

function encodeImageToBase64(filePath) {
  const data = fs.readFileSync(filePath);
  return data.toString("base64");
}

async function extractImageMetadata(filePath) {
  try {
    const exifData = await exifr.parse(filePath, {
      gps: true,
      exif: true,
      iptc: true,
      ifd0: true,
      translateKeys: false,
      translateValues: false,
      reviveValues: true,
      sanitize: true,
      mergeOutput: true,
    });

    const metadata = {};

    // Extract GPS coordinates
    if (exifData.latitude && exifData.longitude) {
      metadata.latitude = exifData.latitude;
      metadata.longitude = exifData.longitude;
    } else if (exifData.GPSLatitude && exifData.GPSLongitude) {
      metadata.latitude = exifData.GPSLatitude;
      metadata.longitude = exifData.GPSLongitude;
    }

    // Extract date/time - prefer DateTimeOriginal, then DateTime, then CreateDate
    if (exifData.DateTimeOriginal) {
      metadata.dateTime = new Date(exifData.DateTimeOriginal);
    } else if (exifData.DateTime) {
      metadata.dateTime = new Date(exifData.DateTime);
    } else if (exifData.CreateDate) {
      metadata.dateTime = new Date(exifData.CreateDate);
    } else if (exifData.ModifyDate) {
      metadata.dateTime = new Date(exifData.ModifyDate);
    }

    // Reverse geocode to get address if we have coordinates
    if (metadata.latitude && metadata.longitude) {
      try {
        const geocodeUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${metadata.latitude}&lon=${metadata.longitude}&zoom=18&addressdetails=1`;
        const geocodeResponse = await fetch(geocodeUrl, {
          headers: {
            "User-Agent": "MushroomFieldNotes/1.0",
          },
        });

        if (geocodeResponse.ok) {
          const geocodeData = await geocodeResponse.json();
          if (geocodeData.display_name) {
            metadata.address = geocodeData.display_name;
          }
        }
      } catch (error) {
        console.error("Error reverse geocoding:", error);
      }
    }

    return metadata;
  } catch (error) {
    console.error("Error extracting EXIF data:", error);
    return {};
  }
}

function getGeminiClient() {
  const apiKey = requireEnv("GEMINI_API_KEY");
  return new GoogleGenerativeAI(apiKey);
}

function buildSystemInstruction() {
  return `
You are a cautious but helpful mushroom identification assistant.

You are analyzing photographs of wild mushrooms. Use ONLY what is visible in the photo.
If you are not reasonably confident, choose a higher-level group (e.g. "Amanita species") rather than an exact species.

Return STRICTLY a JSON object that conforms to this TypeScript type:

type MushroomIdentification = {
  imageFile: string;
  scientificName: string;
  commonName: string;
  confidence: number; // 0-100
  edibility: "Unknown" | "Edible" | "Edible with Caution" | "Inedible" | "Toxic" | "Psychoactive";
  warning: string; // Always include a strong foraging safety disclaimer.
  keyFeatures: {
    cap: string;
    gillsOrPores: string;
    stipe: string;
    sporePrintColor: string;
    other: string;
  };
  ecologicalRole: "Unknown" | "Saprotrophic" | "Mycorrhizal" | "Parasitic";
  habitatNotes: string;
  funFact: string;
  cookingOrUsage: string;
  location: string;
};

Rules:
- confidence must be an integer between 0 and 100.
- Do NOT wrap the JSON in backticks or a code block.
- Do NOT add any commentary outside the JSON.
- If you are unsure about edibility, set edibility to "Unknown" and include a strong warning.
- Set location to "Unknown" if not provided.
`;
}

async function analyzeImage(model, fileName) {
  const filePath = path.join(IMAGES_DIR, fileName);
  const base64 = encodeImageToBase64(filePath);

  const systemInstruction = buildSystemInstruction();

  const result = await model.generateContent({
    contents: [
      {
        role: "user",
        parts: [
          {
            text: systemInstruction,
          },
          {
            inlineData: {
              data: base64,
              mimeType: "image/jpeg",
            },
          },
          {
            text: `Identify the mushroom in this photo and return a single JSON object as described. Use this exact image file name in the "imageFile" field: "${fileName}".`,
          },
        ],
      },
    ],
  });

  const text = result.response.text().trim();

  let jsonText = text;
  if (jsonText.startsWith("```")) {
    jsonText = jsonText.replace(/```json\\s*|```/g, "").trim();
  }

  try {
    const parsed = JSON.parse(jsonText);
    return parsed;
  } catch (err) {
    console.error(`Failed to parse JSON for ${fileName}:`, err);
    console.error("Raw model output:", text);
    return null;
  }
}

async function main() {
  const files = loadImages();

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-3-pro-preview",
  });

  const results = [];

  console.log(`Analyzing ${files.length} images with Gemini 3...\n`);

  for (const file of files) {
    console.log(`Processing ${file}...`);
    try {
      const filePath = path.join(IMAGES_DIR, file);
      
      // Extract EXIF metadata (GPS coordinates and date/time)
      const imageMetadata = await extractImageMetadata(filePath);
      
      const result = await analyzeImage(model, file);
      if (result) {
        // Set location data from EXIF metadata if available
        if (imageMetadata.latitude && imageMetadata.longitude) {
          result.locationData = {
            lat: imageMetadata.latitude,
            lng: imageMetadata.longitude,
            address: imageMetadata.address || `${imageMetadata.latitude.toFixed(6)}, ${imageMetadata.longitude.toFixed(6)}`,
            formattedLocation: imageMetadata.address || `${imageMetadata.latitude.toFixed(6)}, ${imageMetadata.longitude.toFixed(6)}`,
          };
          result.location = imageMetadata.address || `${imageMetadata.latitude.toFixed(6)}, ${imageMetadata.longitude.toFixed(6)}`;
        } else if (!result.location) {
          result.location = "Unknown";
        }

        // Set observation date/time from EXIF if available
        if (imageMetadata.dateTime) {
          result.observationDate = imageMetadata.dateTime.toISOString().split("T")[0];
          result.observationTime = imageMetadata.dateTime.toISOString();
        }
        
        results.push(result);
        console.log(`✓ Done: ${file}${imageMetadata.latitude ? ` (Location: ${imageMetadata.address || `${imageMetadata.latitude.toFixed(4)}, ${imageMetadata.longitude.toFixed(4)}`})` : ""}`);
      } else {
        console.log(`✗ Skipped (parse error): ${file}`);
      }
    } catch (err) {
      console.error(`Error analyzing ${file}:`, err);
    }
  }

  const outputDir = path.dirname(OUTPUT_FILE);
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(results, null, 2), "utf8");
  console.log(`\nSaved ${results.length} identifications to ${OUTPUT_FILE}`);
  console.log(`\nLocation and date/time extracted from image EXIF data when available.`);
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});


