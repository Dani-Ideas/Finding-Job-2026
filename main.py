import asyncio
import sys
from config import ROLES, UBICACION, MAX_PAGINAS
from exporters import exportar_csv
from scrapers.occ import OCCScraper
from scrapers.computrabajo import ComputrabajoScraper
from scrapers.indeed_mx import IndeedMXScraper
from models import Job


SCRAPERS = [
    OCCScraper,
    ComputrabajoScraper,
    IndeedMXScraper,
]


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
    print(f"Buscando empleos en: {UBICACION}")
    print(f"Roles: {', '.join(ROLES)}\n")

    tareas = [
        correr_scraper(cls, ROLES, UBICACION, MAX_PAGINAS)
        for cls in SCRAPERS
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
