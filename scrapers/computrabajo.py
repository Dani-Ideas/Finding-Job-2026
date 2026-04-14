import asyncio
from playwright.async_api import Page
from scrapers.base import BaseScraper
from models import Job


class ComputrabajoScraper(BaseScraper):
    """Scraper para Computrabajo México (mx.computrabajo.com)."""

    nombre = "computrabajo"
    BASE_URL = "https://mx.computrabajo.com/trabajo-de-{rol}-en-{ciudad}?p={pagina}"

    async def _scrape(self, page: Page) -> list[Job]:
        jobs: list[Job] = []
        ciudad_slug = (
            self.ubicacion.lower()
            .replace(" ", "-")
            .replace("á", "a")
            .replace("é", "e")
            .replace("í", "i")
            .replace("ó", "o")
            .replace("ú", "u")
        )

        for rol in self.roles:
            rol_slug = rol.lower().replace(" ", "-")
            print(f"[Computrabajo] Buscando: {rol} en {self.ubicacion}")

            for num_pagina in range(1, self.max_paginas + 1):
                url = self.BASE_URL.format(
                    rol=rol_slug, ciudad=ciudad_slug, pagina=num_pagina
                )
                try:
                    await page.goto(url, timeout=30000, wait_until="domcontentloaded")
                    await asyncio.sleep(1)

                    tarjetas = await page.query_selector_all("article.box_offer")

                    if not tarjetas:
                        print(
                            f"[Computrabajo] Sin resultados en pagina {num_pagina}."
                        )
                        break

                    for tarjeta in tarjetas:
                        job = await self._parsear_tarjeta(tarjeta)
                        if job:
                            jobs.append(job)

                except Exception as e:
                    print(f"[Computrabajo] Error en {url}: {e}")
                    break

        return jobs

    async def _parsear_tarjeta(self, tarjeta):
        try:
            titulo_el = await tarjeta.query_selector("h2 a, .title_offer a")
            titulo = (await titulo_el.inner_text()).strip() if titulo_el else "Sin titulo"

            href = await titulo_el.get_attribute("href") if titulo_el else ""
            url = (
                f"https://mx.computrabajo.com{href}"
                if href and href.startswith("/")
                else href or ""
            )

            empresa_el = await tarjeta.query_selector(".fs16.fc_base, .company")
            empresa = (
                (await empresa_el.inner_text()).strip() if empresa_el else "Sin empresa"
            )

            ubicacion_el = await tarjeta.query_selector(".fc_aux, .location")
            ubicacion_txt = (
                (await ubicacion_el.inner_text()).strip() if ubicacion_el else ""
            )

            tarjeta_texto = await tarjeta.inner_text()
            modalidad = self.detectar_modalidad(tarjeta_texto)

            fecha_el = await tarjeta.query_selector(".fc_aux time, time")
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
            print(f"[Computrabajo] Error parseando tarjeta: {e}")
            return None
