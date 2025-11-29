import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import exifr from "exifr";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

function encodeImageToBase64(filePath: string): string {
  const data = fs.readFileSync(filePath);
  return data.toString("base64");
}

async function extractImageMetadata(filePath: string) {
  try {
    // Read the file as a buffer for exifr
    const fileBuffer = fs.readFileSync(filePath);
    const exifData = await exifr.parse(fileBuffer, {
      gps: true,
      exif: true,
      iptc: true,
      translateKeys: false,
      translateValues: false,
      reviveValues: true,
      sanitize: true,
      mergeOutput: true,
    }) as Record<string, unknown>;

    const metadata: {
      latitude?: number;
      longitude?: number;
      dateTime?: Date;
      address?: string;
    } = {};

    // Extract GPS coordinates
    if (typeof exifData.latitude === "number" && typeof exifData.longitude === "number") {
      metadata.latitude = exifData.latitude;
      metadata.longitude = exifData.longitude;
    } else if (typeof exifData.GPSLatitude === "number" && typeof exifData.GPSLongitude === "number") {
      metadata.latitude = exifData.GPSLatitude;
      metadata.longitude = exifData.GPSLongitude;
    }

    // Extract date/time - prefer DateTimeOriginal, then DateTime, then CreateDate
    if (exifData.DateTimeOriginal) {
      metadata.dateTime = new Date(exifData.DateTimeOriginal as string | number | Date);
    } else if (exifData.DateTime) {
      metadata.dateTime = new Date(exifData.DateTime as string | number | Date);
    } else if (exifData.CreateDate) {
      metadata.dateTime = new Date(exifData.CreateDate as string | number | Date);
    } else if (exifData.ModifyDate) {
      metadata.dateTime = new Date(exifData.ModifyDate as string | number | Date);
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

export async function POST(request: Request) {
  try {
    console.log("[API /api/analyze POST] Received analysis request");
    const body = await request.json();
    const { imageFile } = body;
    console.log("[API /api/analyze POST] Image file:", imageFile);

    if (!imageFile) {
      console.error("[API /api/analyze POST] Missing imageFile parameter");
      return NextResponse.json({ error: "imageFile is required" }, { status: 400 });
    }

    const imagesDir = path.join(process.cwd(), "public", "images");
    const filePath = path.join(imagesDir, imageFile);
    console.log("[API /api/analyze POST] Full file path:", filePath);

    if (!fs.existsSync(filePath)) {
      console.error("[API /api/analyze POST] Image file not found:", filePath);
      return NextResponse.json({ error: "Image file not found" }, { status: 404 });
    }

    // Extract EXIF metadata (GPS coordinates and date/time)
    console.log("[API /api/analyze POST] Extracting EXIF metadata...");
    const imageMetadata = await extractImageMetadata(filePath);
    console.log("[API /api/analyze POST] EXIF metadata:", {
      hasLocation: !!(imageMetadata.latitude && imageMetadata.longitude),
      latitude: imageMetadata.latitude,
      longitude: imageMetadata.longitude,
      hasDateTime: !!imageMetadata.dateTime,
      address: imageMetadata.address,
    });

    const base64 = encodeImageToBase64(filePath);
    const systemInstruction = buildSystemInstruction();

    console.log("[API /api/analyze POST] Calling Gemini API for identification...");
    const model = genAI.getGenerativeModel({
      model: "gemini-3-pro-preview",
    });

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
              text: `Identify the mushroom in this photo and return a single JSON object as described. Use this exact image file name in the "imageFile" field: "${imageFile}".`,
            },
          ],
        },
      ],
    });

    const text = result.response.text().trim();
    console.log("[API /api/analyze POST] ✓ Received response from Gemini");
    let jsonText = text;
    if (jsonText.startsWith("```")) {
      jsonText = jsonText.replace(/```json\s*|```/g, "").trim();
    }

    const parsed = JSON.parse(jsonText);
    console.log("[API /api/analyze POST] ✓ Parsed identification:", {
      scientificName: parsed.scientificName,
      commonName: parsed.commonName,
      confidence: parsed.confidence,
    });
    
    // Set location data from EXIF metadata if available
    if (imageMetadata.latitude && imageMetadata.longitude) {
      parsed.locationData = {
        lat: imageMetadata.latitude,
        lng: imageMetadata.longitude,
        address: imageMetadata.address || `${imageMetadata.latitude.toFixed(6)}, ${imageMetadata.longitude.toFixed(6)}`,
        formattedLocation: imageMetadata.address || `${imageMetadata.latitude.toFixed(6)}, ${imageMetadata.longitude.toFixed(6)}`,
      };
      parsed.location = imageMetadata.address || `${imageMetadata.latitude.toFixed(6)}, ${imageMetadata.longitude.toFixed(6)}`;
    } else if (!parsed.location) {
      parsed.location = "Unknown";
    }

    // Set observation date/time from EXIF if available
    if (imageMetadata.dateTime) {
      parsed.observationDate = imageMetadata.dateTime.toISOString().split("T")[0];
      parsed.observationTime = imageMetadata.dateTime.toISOString();
    }

    // Generate info card using gemini-3-pro-image-preview
    console.log("[API /api/analyze POST] Generating info card...");
    try {
      const imageModel = genAI.getGenerativeModel({
        model: "gemini-3-pro-image-preview",
      });

      const infoCardPrompt = `Create a beautiful, informative field guide card for the mushroom "${parsed.commonName}" (${parsed.scientificName}).

The card should be designed in a 4:3 aspect ratio (landscape orientation) with a field guide aesthetic. Include:

1. **Header Section**: Large, elegant title with the common name prominently displayed, with the scientific name in italics below
2. **Key Characteristics Section**: 
   - Cap: ${parsed.keyFeatures.cap}
   - Gills/Pores: ${parsed.keyFeatures.gillsOrPores}
   - Stipe (stem): ${parsed.keyFeatures.stipe}
   - Spore Print: ${parsed.keyFeatures.sporePrintColor}
3. **Ecological Information**: 
   - Ecological Role: ${parsed.ecologicalRole}
   - Habitat: ${parsed.habitatNotes}
4. **Edibility Status**: Display "${parsed.edibility}" with appropriate color coding (red for toxic, green for edible, yellow for caution)
5. **Interesting Fact**: ${parsed.funFact}
6. **Safety Warning**: Include a prominent warning: "${parsed.warning}"

Design the card with:
- A cream/beige background with subtle texture (like aged paper)
- Elegant serif typography for headings
- Clean, readable sans-serif for body text
- Botanical illustration style borders or decorative elements
- Professional field guide layout with clear sections
- Use colors that match the edibility status (emerald green for edible, amber for caution, red for toxic)
- Make it visually appealing and easy to read

The card should look like it belongs in a professional mycological field guide.`;

      const imageResponse = await imageModel.generateContent(
        infoCardPrompt,
        {
          imageConfig: {
            aspectRatio: "4:3",
            imageSize: "2K", // 2K resolution for good quality
          },
        } as Record<string, unknown>
      );

      // Extract the generated image from response
      const response = imageResponse.response;
      const candidates = response.candidates;
      
      if (candidates && candidates.length > 0) {
        const parts = candidates[0].content?.parts;
        if (parts) {
          for (const part of parts) {
            if (part.inlineData && part.inlineData.data) {
              parsed.infoCardImage = part.inlineData.data;
              console.log("[API /api/analyze POST] ✓ Info card generated successfully");
              break;
            }
          }
        }
      }
      
      if (!parsed.infoCardImage) {
        console.log("[API /api/analyze POST] ⚠ Info card not generated (no image data in response)");
      }
    } catch (error: unknown) {
      console.error("[API /api/analyze POST] ✗ Error generating info card:", error);
      // Continue without info card if generation fails
    }

    console.log("[API /api/analyze POST] ✓ Returning complete analysis result");
    return NextResponse.json(parsed);
  } catch (error: unknown) {
    console.error("Error analyzing image:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to analyze image";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

