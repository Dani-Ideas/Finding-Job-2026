import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url");
  if (!url) {
    return NextResponse.json({ error: "Missing url" }, { status: 400 });
  }

  try {
    new URL(url); // valida que sea una URL real
  } catch {
    return NextResponse.json({ error: "URL inválida" }, { status: 400 });
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "Accept-Language": "es-MX,es;q=0.9,en;q=0.8",
      },
      signal: AbortSignal.timeout(12000),
    });

    const html = await response.text();

    // Inyectar <base> para que los recursos relativos carguen correctamente
    const origin = new URL(url).origin;
    const fixedHtml = html
      .replace(/<base[^>]*>/gi, "")
      .replace(/(<head[^>]*>)/i, `$1<base href="${origin}/">`);

    return new NextResponse(fixedHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "X-Frame-Options": "SAMEORIGIN",
        "Content-Security-Policy":
          "default-src * 'unsafe-inline' 'unsafe-eval' data: blob:",
      },
    });
  } catch (e) {
    const errorHtml = `<!DOCTYPE html><html><body style="font-family:monospace;padding:2rem;background:#1a1a2e;color:#f0ede6;">
      <h3 style="color:#e63946">No se pudo cargar la vista previa</h3>
      <p style="color:#888;margin:0.5rem 0">${String(e)}</p>
      <a href="${url}" target="_blank" style="color:#e63946;font-size:0.85rem">
        Abrir directamente en el navegador →
      </a>
    </body></html>`;
    return new NextResponse(errorHtml, {
      headers: { "Content-Type": "text/html; charset=utf-8" },
    });
  }
}
