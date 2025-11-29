import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

export async function GET() {
  try {
    const imagesDir = path.join(process.cwd(), "public", "images");
    
    if (!fs.existsSync(imagesDir)) {
      return NextResponse.json([]);
    }

    const allFiles = fs.readdirSync(imagesDir);
    const imageFiles = allFiles.filter((f) =>
      /\.(jpe?g|png|webp)$/i.test(f)
    );

    // Get list of already processed images
    const dataFile = path.join(process.cwd(), "src", "data", "mushrooms.json");
    let processedImages: string[] = [];
    
    if (fs.existsSync(dataFile)) {
      const raw = fs.readFileSync(dataFile, "utf8");
      const data = JSON.parse(raw);
      processedImages = data.map((m: any) => m.imageFile);
    }

    // Return only unprocessed images
    const unprocessed = imageFiles.filter((img) => !processedImages.includes(img));

    return NextResponse.json(unprocessed.sort());
  } catch (error) {
    console.error("Error loading images:", error);
    return NextResponse.json([], { status: 500 });
  }
}

