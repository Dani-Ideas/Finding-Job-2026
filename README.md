# Job Scraper — CDMX

Scraper automatizado que busca ofertas de empleo para ingenieros en computación en bolsas de trabajo y portales corporativos de México.

---

## Quick Start

### 1. Clonar el repositorio

```bash
git clone <url-del-repo>
cd scraper
```

### 2. Crear el entorno virtual e instalar dependencias

```bash
python -m venv venv
source venv/bin/activate      # Linux / Mac
# venv\Scripts\activate       # Windows

pip install -r requirements.txt
playwright install chromium
```

### 3. Configurar la búsqueda

Edita [`config.py`](config.py) para ajustar los roles y la ubicación:

```python
ROLES = ["backend", "frontend", "data scientist", ...]
UBICACION = "Ciudad de Mexico"
MAX_PAGINAS = 5
```

### 4. Correr el scraper

```bash
python main.py
```

Los resultados se guardan en un archivo `empleos_YYYY-MM-DD.csv` en el directorio raíz.

---

## Documentacion

| Tema | Descripcion |
|---|---|
| [Arquitectura del proyecto](Documentation/arquitectura.md) | Como estan organizados los modulos y como se comunican |
| [Sitios objetivo](Documentation/sitios.md) | Que portales se scrapeany como agregar nuevos |
| [Modelo de datos](Documentation/modelo.md) | Estructura del objeto `Job` y campos del CSV |
| [Como agregar un scraper](Documentation/nuevo-scraper.md) | Guia paso a paso para agregar un portal nuevo |
| [Consideraciones legales y eticas](Documentation/legal.md) | robots.txt, rate limiting y buenas practicas |

---

## Sitios soportados

| Fuente | Tipo |
|---|---|
| OCC Mundial | Bolsa de trabajo MX |
| Computrabajo | Bolsa de trabajo MX |
| Indeed México | Bolsa de trabajo MX |

> Los portales corporativos (Kavak, Clip, Bitso, etc.) se agregan en la Fase 3.

---

## Estructura del proyecto

```
scraper/
├── main.py              # Orquestador principal
├── config.py            # Roles, ubicacion y parametros
├── models.py            # Dataclass Job
├── exporters.py         # Deduplicacion y exportacion CSV
├── scrapers/
│   ├── base.py          # Clase base con Playwright
│   ├── occ.py
│   ├── computrabajo.py
│   └── indeed_mx.py
├── Documentation/       # Documentacion detallada
└── requirements.txt
```
