import { NextRequest, NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import type { AppConfig } from "@/lib/types";

const CONFIG_PATH = path.join(process.cwd(), "..", "config.py");

function parseList(content: string, varName: string): string[] {
  const match = content.match(new RegExp(`${varName}\\s*=\\s*\\[([^\\]]+)\\]`, "s"));
  if (!match) return [];
  return [...match[1].matchAll(/"([^"]+)"|'([^']+)'/g)].map((m) => m[1] ?? m[2]);
}

function parseDict(content: string, varName: string): Record<string, boolean> {
  const match = content.match(new RegExp(`${varName}\\s*=\\s*\\{([^}]+)\\}`, "s"));
  if (!match) return {};
  const result: Record<string, boolean> = {};
  for (const m of match[1].matchAll(/"([^"]+)"\s*:\s*(True|False)/g)) {
    result[m[1]] = m[2] === "True";
  }
  return result;
}

function parseNumber(content: string, varName: string): number {
  const match = content.match(new RegExp(`${varName}\\s*=\\s*(\\d+)`));
  return match ? Number(match[1]) : 5;
}

function toList(items: string[]): string {
  return `[\n${items.map((i) => `    "${i}",`).join("\n")}\n]`;
}

function toDict(obj: Record<string, boolean>): string {
  const entries = Object.entries(obj)
    .map(([k, v]) => `    "${k}": ${v ? "True" : "False"},`)
    .join("\n");
  return `{\n${entries}\n}`;
}

export async function GET() {
  try {
    const content = fs.readFileSync(CONFIG_PATH, "utf-8");
    const config: AppConfig = {
      roles: parseList(content, "ROLES"),
      modalidades: parseList(content, "MODALIDADES"),
      ubicaciones: parseList(content, "UBICACIONES"),
      scrapers: parseDict(content, "SCRAPERS_ACTIVOS"),
      max_paginas: parseNumber(content, "MAX_PAGINAS"),
    };
    return NextResponse.json(config);
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const config = (await request.json()) as AppConfig;

    const py = `# ─── Roles de búsqueda ─────────────────────────────────────────────────────
ROLES = ${toList(config.roles)}

# ─── Modalidades aceptadas ──────────────────────────────────────────────────
MODALIDADES = ${toList(config.modalidades)}

# ─── Ubicaciones ────────────────────────────────────────────────────────────
UBICACION = "${config.ubicaciones[0] ?? "Ciudad de Mexico"}"

UBICACIONES = ${toList(config.ubicaciones)}

# ─── Scraping ───────────────────────────────────────────────────────────────
MAX_PAGINAS = ${config.max_paginas}

SCRAPERS_ACTIVOS = ${toDict(config.scrapers)}
`;

    fs.writeFileSync(CONFIG_PATH, py, "utf-8");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
