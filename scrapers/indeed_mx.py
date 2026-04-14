import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class IndeedMXScraper(BaseScraper):
    """Scraper para Indeed México (indeed.com.mx)."""

    nombre = "indeed"
    BASE_URL = "https://mx.indeed.com/jobs?q={rol}&l={ciudad}&start={inicio}"

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []

        for rol in self.roles:
            print(f"[Indeed] Buscando: {rol} en {self.ubicacion}")

            for num_pagina in range(self.max_paginas):
                inicio = num_pagina * 10  # Indeed pagina de 10 en 10
                url = self.BASE_URL.format(
                    rol=rol.replace(" ", "+"),
                    ciudad=self.ubicacion.replace(" ", "+"),
                    inicio=inicio,
                )
                try:
                    await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    await asyncio.sleep(2)  # Indeed carga lento con JS

                    # Aceptar cookies si aparece el banner
                    boton_cookies = await page.query_selector(
                        "button#onetrust-accept-btn-handler"
                    )
                    if boton_cookies:
                        await boton_cookies.click()
                        await asyncio.sleep(1)

                    tarjetas = await page.query_selector_all(
                        "div.job_seen_beacon, li.css-1ac2h1w"
                    )

                    if not tarjetas:
                        print(f"[Indeed] Sin resultados en pagina {num_pagina + 1}.")
                        break

                    for tarjeta in tarjetas:
                        job = await self._parsear_tarjeta(tarjeta)
                        if job:
                            jobs.append(job)

                except Exception as e:
                    print(f"[Indeed] Error en {url}: {e}")
                    break

        return jobs

    async def _parsear_tarjeta(self, tarjeta):
        try:
            titulo_el = await tarjeta.query_selector(
                "h2.jobTitle a, [data-testid='job-title'] a"
            )
            titulo = (
                (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"
            )

            href = await titulo_el.get_attribute("href") if titulo_el else ""
            url = (
                f"https://mx.indeed.com{href}"
                if href and href.startswith("/")
                else href or ""
            )

            empresa_el = await tarjeta.query_selector(
                "[data-testid='company-name'], .companyName"
            )
            empresa = (
                (await empresa_el.inner_text()).strip()
                if empresa_el
                else "Sin empresa"
            )

            ubicacion_el = await tarjeta.query_selector(
                "[data-testid='text-location'], .companyLocation"
            )
            ubicacion_txt = (
                (await ubicacion_el.inner_text()).strip() if ubicacion_el else ""
            )

            tarjeta_texto = await tarjeta.inner_text()
            modalidad = self.detectar_modalidad(tarjeta_texto)

            fecha_el = await tarjeta.query_selector("span.date, [data-testid='myJobsStateDate']")
            fecha = (await fecha_el.inner_text()).strip() if fecha_el else ""

            return Job(
                titulo=titulo,
                empresa=empresa,
                ubicacion=ubicacion_txt or self.ubicacion,
                modalidad=modalidad,
                descripcion="",
                url=url,
                fuente=self.nombre,
                fecha_publicacion=fecha,
            )
        except Exception as e:
            print(f"[Indeed] Error parseando tarjeta: {e}")
            return None
