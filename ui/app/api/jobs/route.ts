import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import Papa from "papaparse";

const SCRAPER_DIR = path.join(process.cwd(), "..");

export async function GET(request: NextRequest) {
  const filename = request.nextUrl.searchParams.get("csv");
  if (!filename) {
    return NextResponse.json({ error: "Missing csv param" }, { status: 400 });
  }

  // Validación: solo archivos empleos_YYYY-MM-DD.csv
  if (!/^empleos_\d{4}-\d{2}-\d{2}\.csv$/.test(filename)) {
    return NextResponse.json({ error: "Filename inválido" }, { status: 400 });
  }

  const filePath = path.join(SCRAPER_DIR, filename);
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 });
  }

  const content = fs.readFileSync(filePath, "utf-8");
  const { data } = Papa.parse(content, { header: true, skipEmptyLines: true });

  return NextResponse.json(data);
}
