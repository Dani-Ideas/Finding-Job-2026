import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class ProbecariosScraper(BaseScraper):
    """Scraper para probecarios.com — bolsa especializada en becarios México."""

    nombre = "probecarios"
    SEARCH_URL = "https://probecarios.com/vacantes?buscar={rol}"

    # Solo buscamos roles de pasante para este sitio
    ROLES_INTERN = [
        "becario", "practicante", "intern", "trainee", "junior", "student",
    ]

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []

        roles_a_buscar = [
            r for r in self.roles
            if any(kw in r.lower() for kw in self.ROLES_INTERN)
        ] or ["becario sistemas", "practicante desarrollo"]

        for rol in roles_a_buscar:
            rol_slug = rol.lower().replace(" ", "+")
            url = self.SEARCH_URL.format(rol=rol_slug)
            print(f"[probecarios] Buscando: {rol}")

            try:
                await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                await asyncio.sleep(2)

                tarjetas = await page.query_selector_all(
                    ".vacancy-card, .job-card, article.card, .vacante-item, "
                    "[class*='vacancy'], [class*='vacante']"
                )

                if not tarjetas:
                    # Fallback genérico
                    tarjetas = await page.query_selector_all("article, .result-item")

                for tarjeta in tarjetas:
                    job = await self._parsear_tarjeta(tarjeta)
                    if job:
                        jobs.append(job)

            except Exception as e:
                print(f"[probecarios] Error en {url}: {e}")

        return jobs

    async def _parsear_tarjeta(self, tarjeta) -> Job | None:
        try:
            titulo_el = await tarjeta.query_selector("h2, h3, .title, .job-title, a.nombre, [class*='title']")
            titulo = (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"

            href_el = await tarjeta.query_selector("a[href]")
            href = await href_el.get_attribute("href") if href_el else ""
            url = (
                f"https://probecarios.com{href}"
                if href and href.startswith("/")
                else href or ""
            )

            empresa_el = await tarjeta.query_selector(
                ".company, .empresa, .empleador, [class*='company'], [class*='empresa']"
            )
            empresa = (await empresa_el.inner_text()).strip() if empresa_el else "Sin empresa"

            texto = await tarjeta.inner_text()
            modalidad = self.detectar_modalidad(texto)

            return Job(
                titulo=titulo,
                empresa=empresa,
                ubicacion="México",
                modalidad=modalidad or "no especificado",
                descripcion="",
                url=url,
                fuente=self.nombre,
                fecha_publicacion="",
            )
        except Exception as e:
            print(f"[probecarios] Error parseando tarjeta: {e}")
            return None
