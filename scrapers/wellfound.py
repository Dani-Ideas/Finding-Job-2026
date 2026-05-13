import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class WellfoundScraper(BaseScraper):
    """Scraper para wellfound.com (antes AngelList) — startups.
    Deshabilitado por defecto (JS-heavy, requiere paciencia).
    """

    nombre = "wellfound"
    SEARCH_URL = "https://wellfound.com/jobs?query={rol}&remote=true"

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []

        # Limitamos roles porque Wellfound es lento
        for rol in self.roles[:6]:
            rol_slug = rol.lower().replace(" ", "%20")
            url = self.SEARCH_URL.format(rol=rol_slug)
            print(f"[wellfound] Buscando: {rol}")

            try:
                await page.goto(url, timeout=45000, wait_until="networkidle")
                await asyncio.sleep(3)

                tarjetas = await page.query_selector_all(
                    "[data-test='StartupResult'], "
                    "[class*='JobListings'] > div, "
                    "div[class*='jobResult']"
                )

                for tarjeta in tarjetas[:20]:
                    job = await self._parsear_tarjeta(tarjeta)
                    if job:
                        jobs.append(job)

            except Exception as e:
                print(f"[wellfound] Error en {url}: {e}")

        return jobs

    async def _parsear_tarjeta(self, tarjeta) -> Job | None:
        try:
            titulo_el = await tarjeta.query_selector(
                "a[data-test='job-title'], h2, [class*='jobTitle'], .job-name"
            )
            titulo = (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"

            empresa_el = await tarjeta.query_selector(
                "[data-test='company-name'], [class*='companyLink'], h3"
            )
            empresa = (await empresa_el.inner_text()).strip() if empresa_el else "Sin empresa"

            href_el = await tarjeta.query_selector("a[href*='/jobs/']")
            href = await href_el.get_attribute("href") if href_el else ""
            url = (
                f"https://wellfound.com{href}"
                if href and href.startswith("/")
                else href or ""
            )

            texto = await tarjeta.inner_text()
            modalidad = self.detectar_modalidad(texto) or "remoto"

            return Job(
                titulo=titulo,
                empresa=empresa,
                ubicacion="Remote",
                modalidad=modalidad,
                descripcion="",
                url=url,
                fuente=self.nombre,
                fecha_publicacion="",
            )
        except Exception as e:
            print(f"[wellfound] Error parseando tarjeta: {e}")
            return None
