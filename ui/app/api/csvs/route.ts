import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const SCRAPER_DIR = path.join(process.cwd(), "..");

export async function GET() {
  try {
    const files = fs.readdirSync(SCRAPER_DIR);
    const csvFiles = files
      .filter((f) => /^empleos_\d{4}-\d{2}-\d{2}\.csv$/.test(f))
      .map((f) => ({
        filename: f,
        date: f.replace("empleos_", "").replace(".csv", ""),
      }))
      .sort((a, b) => b.date.localeCompare(a.date));

    return NextResponse.json(csvFiles);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
