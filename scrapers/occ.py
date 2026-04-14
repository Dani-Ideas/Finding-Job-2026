import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class OCCScraper(BaseScraper):
    """Scraper para OCC Mundial (occ.com.mx)."""

    nombre = "occ"
    BASE_URL = "https://www.occ.com.mx/empleos/de-{rol}/en-{ciudad}/?page={pagina}"

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []
        ciudad_slug = self.ubicacion.lower().replace(" ", "-")

        for rol in self.roles:
            rol_slug = rol.lower().replace(" ", "-")
            print(f"[OCC] Buscando: {rol} en {self.ubicacion}")

            for num_pagina in range(1, self.max_paginas + 1):
                url = self.BASE_URL.format(
                    rol=rol_slug, ciudad=ciudad_slug, pagina=num_pagina
                )
                try:
                    await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    await asyncio.sleep(1)  # pausa cortés

                    tarjetas = await page.query_selector_all("article.job-item")

                    if not tarjetas:
                        # Intenta selector alternativo
                        tarjetas = await page.query_selector_all(
                            "[data-qa='job-card']"
                        )

                    if not tarjetas:
                        print(f"[OCC] Sin resultados en pagina {num_pagina}, saliendo.")
                        break

                    for tarjeta in tarjetas:
                        job = await self._parsear_tarjeta(tarjeta, page)
                        if job:
                            jobs.append(job)

                except Exception as e:
                    print(f"[OCC] Error en {url}: {e}")
                    break

        return jobs

    async def _parsear_tarjeta(self, tarjeta, page: Page):
        try:
            # Titulo
            titulo_el = await tarjeta.query_selector("a.job-title, h2 a, [data-qa='job-title']")
            titulo = (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"

            # URL de la oferta
            href = await titulo_el.get_attribute("href") if titulo_el else ""
            url = f"https://www.occ.com.mx{href}" if href and href.startswith("/") else href or ""

            # Empresa
            empresa_el = await tarjeta.query_selector(".company-name, [data-qa='job-company']")
            empresa = (await empresa_el.inner_text()).strip() if empresa_el else "Sin empresa"

            # Ubicacion
            ubicacion_el = await tarjeta.query_selector(".location, [data-qa='job-location']")
            ubicacion_txt = (await ubicacion_el.inner_text()).strip() if ubicacion_el else ""

            # Modalidad se detecta del texto completo de la tarjeta
            tarjeta_texto = await tarjeta.inner_text()
            modalidad = self.detectar_modalidad(tarjeta_texto)

            # Fecha
            fecha_el = await tarjeta.query_selector(".publication-date, time, [data-qa='job-date']")
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
            print(f"[OCC] Error parseando tarjeta: {e}")
            return None
