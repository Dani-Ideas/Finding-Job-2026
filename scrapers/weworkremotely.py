import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class WeWorkRemotelyScraper(BaseScraper):
    """Scraper para weworkremotely.com — trabajos remotos globales."""

    nombre = "weworkremotely"

    CATEGORIES = [
        "https://weworkremotely.com/categories/remote-programming-jobs",
        "https://weworkremotely.com/categories/remote-full-stack-programming-jobs",
        "https://weworkremotely.com/categories/remote-back-end-programming-jobs",
        "https://weworkremotely.com/categories/remote-front-end-programming-jobs",
        "https://weworkremotely.com/categories/remote-dev-ops-sysadmin-jobs",
    ]

    async def _scrape(self, page: Page) -> list[Job]:
        all_jobs: list[Job] = []

        for cat_url in self.CATEGORIES:
            try:
                await page.goto(cat_url, timeout=30000, wait_until="domcontentloaded")
                await asyncio.sleep(1.5)

                tarjetas = await page.query_selector_all("section.jobs article li:not(.view-all)")

                for tarjeta in tarjetas:
                    job = await self._parsear_tarjeta(tarjeta)
                    if job:
                        all_jobs.append(job)

            except Exception as e:
                print(f"[weworkremotely] Error en {cat_url}: {e}")

        # Filtrar por roles relevantes
        return [
            j for j in all_jobs
            if any(rol.lower() in j.titulo.lower() for rol in self.roles)
        ]

    async def _parsear_tarjeta(self, tarjeta) -> Job | None:
        try:
            link_el = await tarjeta.query_selector("a")
            href = await link_el.get_attribute("href") if link_el else ""
            url = f"https://weworkremotely.com{href}" if href and href.startswith("/") else href or ""

            titulo_el = await tarjeta.query_selector("span.title")
            titulo = (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"

            empresa_el = await tarjeta.query_selector("span.company")
            empresa = (await empresa_el.inner_text()).strip() if empresa_el else "Sin empresa"

            return Job(
                titulo=titulo,
                empresa=empresa,
                ubicacion="Remote / Worldwide",
                modalidad="remoto",
                descripcion="",
                url=url,
                fuente=self.nombre,
                fecha_publicacion="",
            )
        except Exception as e:
            print(f"[weworkremotely] Error parseando tarjeta: {e}")
            return None
