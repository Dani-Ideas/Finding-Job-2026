from dataclasses import dataclass, field
from datetime import date


@dataclass
class Job:
    titulo: str
    empresa: str
    ubicacion: str
    modalidad: str          # remoto / hibrido / presencial / no especificado
    descripcion: str
    url: str
    fuente: str             # occ / computrabajo / indeed / kavak / etc.
    fecha_publicacion: str  # tal como aparece en el sitio
    fecha_scraping: str = field(default_factory=lambda: date.today().isoformat())

    def as_dict(self) -> dict:
        return {
            "titulo": self.titulo,
            "empresa": self.empresa,
            "ubicacion": self.ubicacion,
            "modalidad": self.modalidad,
            "descripcion": self.descripcion,
            "url": self.url,
            "fuente": self.fuente,
            "fecha_publicacion": self.fecha_publicacion,
            "fecha_scraping": self.fecha_scraping,
        }
