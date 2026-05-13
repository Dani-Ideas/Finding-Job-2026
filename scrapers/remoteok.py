import asyncio
import json
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class RemoteOKScraper(BaseScraper):
    """Scraper para remoteok.com via JSON API pública. Todos los trabajos son remotos."""

    nombre = "remoteok"
    API_URL = "https://remoteok.com/api"

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []
        try:
            await page.set_extra_http_headers({"Accept": "application/json"})
            await page.goto(self.API_URL, timeout=30000, wait_until="domcontentloaded")
            await asyncio.sleep(2)

            content = await page.evaluate("() => document.body.innerText")
            data = json.loads(content)

            # El primer elemento es metadata, el resto son jobs
            for item in data[1:]:
                if not isinstance(item, dict):
                    continue

                titulo = item.get("position", "")
                empresa = item.get("company", "")
                tags: list[str] = item.get("tags", [])
                descripcion = item.get("description", "")
                url = item.get("url", "") or f"https://remoteok.com/l/{item.get('slug', '')}"
                fecha = item.get("date", "")

                # Filtrar por roles relevantes
                texto = f"{titulo} {descripcion} {' '.join(tags)}".lower()
                if not any(rol.lower() in texto for rol in self.roles):
                    continue

                jobs.append(Job(
                    titulo=titulo,
                    empresa=empresa,
                    ubicacion="Remote / Worldwide",
                    modalidad="remoto",
                    descripcion=(descripcion[:500] if descripcion else ""),
                    url=url,
                    fuente=self.nombre,
                    fecha_publicacion=fecha,
                ))

        except Exception as e:
            print(f"[remoteok] Error: {e}")

        return jobs
