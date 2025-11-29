import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { MushroomIdentification } from "@/types/mushroom";

export async function GET() {
  try {
    const filePath = path.join(process.cwd(), "src", "data", "mushrooms.json");
    
    if (!fs.existsSync(filePath)) {
      return NextResponse.json([]);
    }

    const raw = fs.readFileSync(filePath, "utf8");
    const parsed = JSON.parse(raw) as MushroomIdentification[];
    
    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Error loading mushroom data:", error);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    console.log("[API /api/mushrooms POST] Received save request");
    const body = await request.json();
    const newObservation = body as MushroomIdentification;
    
    console.log("[API /api/mushrooms POST] Observation to save:", {
      imageFile: newObservation.imageFile,
      scientificName: newObservation.scientificName,
      commonName: newObservation.commonName,
      location: newObservation.location,
    });

    const filePath = path.join(process.cwd(), "src", "data", "mushrooms.json");
    console.log("[API /api/mushrooms POST] File path:", filePath);
    
    // Load existing data
    let existing: MushroomIdentification[] = [];
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf8");
      existing = JSON.parse(raw);
      console.log("[API /api/mushrooms POST] Loaded existing observations:", existing.length);
    } else {
      console.log("[API /api/mushrooms POST] No existing file, starting fresh");
    }

    // Check if this image already exists and update it, or add new
    const existingIndex = existing.findIndex(
      (m) => m.imageFile === newObservation.imageFile
    );

    if (existingIndex >= 0) {
      // Update existing
      console.log("[API /api/mushrooms POST] Updating existing observation at index", existingIndex);
      existing[existingIndex] = newObservation;
    } else {
      // Add new
      console.log("[API /api/mushrooms POST] Adding new observation");
      existing.push(newObservation);
    }

    // Ensure directory exists
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
      console.log("[API /api/mushrooms POST] Creating directory:", dir);
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save updated data
    console.log("[API /api/mushrooms POST] Writing to file, total observations:", existing.length);
    fs.writeFileSync(filePath, JSON.stringify(existing, null, 2), "utf8");
    console.log("[API /api/mushrooms POST] ✓ Successfully wrote to file");

    // Verify the write
    const verification = fs.readFileSync(filePath, "utf8");
    const verifiedData = JSON.parse(verification);
    console.log("[API /api/mushrooms POST] ✓ Verification: File contains", verifiedData.length, "observations");

    return NextResponse.json({ success: true, observation: newObservation });
  } catch (error: any) {
    console.error("[API /api/mushrooms POST] ✗ Error saving observation:", error);
    console.error("[API /api/mushrooms POST] Error stack:", error.stack);
    return NextResponse.json(
      { error: error.message || "Failed to save observation" },
      { status: 500 }
    );
  }
}
