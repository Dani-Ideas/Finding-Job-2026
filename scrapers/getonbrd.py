import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class GetOnBrdScraper(BaseScraper):
    """Scraper para getonbrd.com — empleos tech en LATAM."""

    nombre = "getonbrd"
    SEARCH_URL = "https://www.getonbrd.com/jobs?query={rol}"

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []

        for rol in self.roles:
            rol_slug = rol.lower().replace(" ", "+")
            url = self.SEARCH_URL.format(rol=rol_slug)
            print(f"[getonbrd] Buscando: {rol}")

            try:
                await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                await asyncio.sleep(2)

                tarjetas = await page.query_selector_all(
                    "[data-ui='job-card'], .job-card, "
                    "a[class*='JobCard'], [class*='job-result']"
                )

                for tarjeta in tarjetas:
                    job = await self._parsear_tarjeta(tarjeta)
                    if job:
                        jobs.append(job)

            except Exception as e:
                print(f"[getonbrd] Error en {url}: {e}")

        return jobs

    async def _parsear_tarjeta(self, tarjeta) -> Job | None:
        try:
            titulo_el = await tarjeta.query_selector(
                "h2, h3, .job-title, [data-ui='job-title'], [class*='JobTitle']"
            )
            titulo = (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"

            empresa_el = await tarjeta.query_selector(
                ".company-name, .employer, [data-ui='company'], [class*='Company']"
            )
            empresa = (await empresa_el.inner_text()).strip() if empresa_el else "Sin empresa"

            href_el = await tarjeta.query_selector("a[href]")
            href = await href_el.get_attribute("href") if href_el else ""
            url = (
                f"https://www.getonbrd.com{href}"
                if href and href.startswith("/")
                else href or ""
            )

            texto = await tarjeta.inner_text()
            modalidad = self.detectar_modalidad(texto)

            return Job(
                titulo=titulo,
                empresa=empresa,
                ubicacion="LATAM / Remote",
                modalidad=modalidad or "remoto",
                descripcion="",
                url=url,
                fuente=self.nombre,
                fecha_publicacion="",
            )
        except Exception as e:
            print(f"[getonbrd] Error parseando tarjeta: {e}")
            return None
