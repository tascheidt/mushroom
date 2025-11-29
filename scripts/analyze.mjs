#!/usr/bin/env node

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import inquirer from "inquirer";
import dotenv from "dotenv";
import { GoogleGenerativeAI } from "@google/generative-ai";

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

async function promptForLocation() {
  const { location } = await inquirer.prompt([
    {
      type: "input",
      name: "location",
      message:
        "Enter the location for this batch in the format:\n[Specific Location/Park], [City/Region], [State/Country], [Habitat Type]\nExample: Forest Park Trail 5, Portland, Oregon, Mixed Conifer Forest\n\nLocation:",
      validate: (input) => {
        if (!input || input.length < 5) return "Please enter a descriptive location.";
        const parts = input.split(",").map((p) => p.trim());
        if (parts.length < 3) {
          return "Please include at least: [Specific Location], [City/Region], [State/Country].";
        }
        return true;
      },
    },
  ]);
  return location.trim();
}

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

function getGeminiClient() {
  const apiKey = requireEnv("GEMINI_API_KEY");
  return new GoogleGenerativeAI(apiKey);
}

function buildSystemInstruction(location) {
  return `
You are a cautious but helpful mushroom identification assistant.

You are analyzing photographs of wild mushrooms taken at this location:
${location}

Use ONLY what is visible in the photo plus the location/habitat context.
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
`;
}

async function analyzeImage(model, fileName, location) {
  const filePath = path.join(IMAGES_DIR, fileName);
  const base64 = encodeImageToBase64(filePath);

  const systemInstruction = buildSystemInstruction(location);

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
  const location = await promptForLocation();
  const files = loadImages();

  const genAI = getGeminiClient();
  const model = genAI.getGenerativeModel({
    model: "gemini-3.0-pro",
  });

  const results = [];

  console.log(`Analyzing ${files.length} images with Gemini 3 at location:\n${location}\n`);

  for (const file of files) {
    console.log(`Processing ${file}...`);
    try {
      const result = await analyzeImage(model, file, location);
      if (result) {
        // Ensure location is always set consistently
        result.location = location;
        results.push(result);
        console.log(`✓ Done: ${file}`);
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
}

main().catch((err) => {
  console.error("Unexpected error:", err);
  process.exit(1);
});


