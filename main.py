import asyncio
import sys
from config import ROLES, UBICACION, MAX_PAGINAS, SCRAPERS_ACTIVOS
from exporters import exportar_csv
from scrapers.occ import OCCScraper
from scrapers.computrabajo import ComputrabajoScraper
from scrapers.indeed_mx import IndeedMXScraper
from scrapers.probecarios import ProbecariosScraper
from scrapers.remoteok import RemoteOKScraper
from scrapers.weworkremotely import WeWorkRemotelyScraper
from scrapers.getonbrd import GetOnBrdScraper
from scrapers.wellfound import WellfoundScraper
from scrapers.google_careers import GoogleCareersScraper
from models import Job


SCRAPER_REGISTRY = {
    "occ": OCCScraper,
    "computrabajo": ComputrabajoScraper,
    "indeed_mx": IndeedMXScraper,
    "probecarios": ProbecariosScraper,
    "remoteok": RemoteOKScraper,
    "weworkremotely": WeWorkRemotelyScraper,
    "getonbrd": GetOnBrdScraper,
    "wellfound": WellfoundScraper,
    "google_careers": GoogleCareersScraper,
}


async def correr_scraper(cls, roles, ubicacion, max_paginas) -> list[Job]:
    scraper = cls(roles=roles, ubicacion=ubicacion, max_paginas=max_paginas)
    try:
        jobs = await scraper.scrape()
        print(f"[{scraper.nombre}] {len(jobs)} ofertas encontradas.")
        return jobs
    except Exception as e:
        print(f"[{scraper.nombre}] Error general: {e}")
        return []


async def main():
    activos = [n for n, on in SCRAPERS_ACTIVOS.items() if on]
    print(f"Scrapers activos: {', '.join(activos)}")
    print(f"Roles: {', '.join(ROLES[:5])}... ({len(ROLES)} total)\n")

    tareas = [
        correr_scraper(SCRAPER_REGISTRY[nombre], ROLES, UBICACION, MAX_PAGINAS)
        for nombre in activos
        if nombre in SCRAPER_REGISTRY
    ]

    resultados = await asyncio.gather(*tareas)

    todos: list[Job] = []
    for lista in resultados:
        todos.extend(lista)

    if not todos:
        print("No se encontraron ofertas.")
        sys.exit(0)

    ruta = exportar_csv(todos)
    print(f"\nTotal de ofertas (sin duplicados): {len(todos)}")
    print(f"Guardado en: {ruta}")


if __name__ == "__main__":
    asyncio.run(main())
