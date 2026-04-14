import csv
from datetime import date
from pathlib import Path
from models import Job

CSV_FIELDS = [
    "titulo",
    "empresa",
    "ubicacion",
    "modalidad",
    "descripcion",
    "url",
    "fuente",
    "fecha_publicacion",
    "fecha_scraping",
]


def deduplicar(jobs: list[Job]) -> list[Job]:
    """Elimina duplicados usando la URL como clave unica."""
    seen: set[str] = set()
    unique: list[Job] = []
    for job in jobs:
        if job.url not in seen:
            seen.add(job.url)
            unique.append(job)
    return unique


def exportar_csv(jobs: list[Job], directorio: str = ".") -> Path:
    jobs = deduplicar(jobs)
    nombre = f"empleos_{date.today().isoformat()}.csv"
    ruta = Path(directorio) / nombre

    with ruta.open("w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=CSV_FIELDS)
        writer.writeheader()
        for job in jobs:
            writer.writerow(job.as_dict())

    return ruta
