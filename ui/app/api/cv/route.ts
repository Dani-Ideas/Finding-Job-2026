import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { generateCV } from "@/lib/cv-generator";

const TEMPLATE_PATH = path.join(
  process.cwd(),
  "..",
  "templates",
  "CV_Daniel_Romero_Fullstack.html"
);

export async function POST(request: NextRequest) {
  try {
    const { titulo, descripcion } = (await request.json()) as {
      titulo: string;
      descripcion: string;
    };

    if (!fs.existsSync(TEMPLATE_PATH)) {
      return NextResponse.json({ error: "Template no encontrado" }, { status: 404 });
    }

    const templateHtml = fs.readFileSync(TEMPLATE_PATH, "utf-8");
    const cvHtml = generateCV(templateHtml, { titulo, descripcion: descripcion ?? "" });

    return NextResponse.json({ html: cvHtml });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
