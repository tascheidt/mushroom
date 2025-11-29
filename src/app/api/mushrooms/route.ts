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

