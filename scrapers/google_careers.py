import asyncio
import json
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class GoogleCareersScraper(BaseScraper):
    """Scraper para Google Careers — posiciones entry-level e intern.
    Usa la API JSON de careers.google.com.
    """

    nombre = "google_careers"
    API_URL = (
        "https://careers.google.com/api/v3/search/"
        "?query={query}&page={page}&page_size=20"
        "&employment_type=INTERN&employment_type=PART_TIME&jex=ENTRY_LEVEL"
    )

    QUERIES = [
        "software engineer intern",
        "intern developer",
        "student software engineer",
        "engineering practicum",
    ]

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []

        for query in self.QUERIES:
            q_slug = query.replace(" ", "%20")
            print(f"[google_careers] Buscando: {query}")

            for num_pagina in range(1, min(self.max_paginas, 5) + 1):
                url = self.API_URL.format(query=q_slug, page=num_pagina)
                try:
                    await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    await asyncio.sleep(1)

                    content = await page.evaluate("() => document.body.innerText")
                    data = json.loads(content)

                    resultados = data.get("jobs", [])
                    if not resultados:
                        break

                    for item in resultados:
                        titulo = item.get("title", "")
                        locs = item.get("locations", [])
                        ubicacion = ", ".join(
                            loc.get("display", "") for loc in locs
                        ) or "Global"
                        descripcion = item.get("description", "")[:500]
                        job_id = item.get("id", "")
                        job_url = (
                            f"https://careers.google.com/jobs/results/{job_id}/"
                            if job_id else ""
                        )

                        jobs.append(Job(
                            titulo=titulo,
                            empresa="Google",
                            ubicacion=ubicacion,
                            modalidad=self.detectar_modalidad(f"{descripcion} {ubicacion}"),
                            descripcion=descripcion,
                            url=job_url,
                            fuente=self.nombre,
                            fecha_publicacion="",
                        ))

                except Exception as e:
                    print(f"[google_careers] Error en página {num_pagina}: {e}")
                    break

        return jobs
