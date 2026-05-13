# ─── Roles de búsqueda ─────────────────────────────────────────────────────
ROLES = [
    # Desarrollador general
    "backend",
    "frontend",
    "data scientist",
    "data engineer",
    "fullstack",
    "devops",
    "machine learning",
    "software engineer",
    "desarrollador",
    # Intern / Becario / Part-time (mayor probabilidad de aceptación)
    "software engineer intern",
    "intern developer",
    "becario sistemas",
    "practicante desarrollo",
    "student program",
    "trainee TI",
    "part time developer",
    "intern backend",
    "intern frontend",
    "becario",
    "practicante",
    "junior developer",
    "junior",
]

# ─── Modalidades aceptadas ──────────────────────────────────────────────────
MODALIDADES = [
    "remoto",
    "remote",
    "híbrido",
    "hibrido",
    "hybrid",
    "medio tiempo",
    "part time",
    "part-time",
]

# ─── Ubicaciones ────────────────────────────────────────────────────────────
UBICACION = "Ciudad de Mexico"   # valor por defecto para scrapers que lo requieren

UBICACIONES = [
    "Ciudad de Mexico",
    "Mexico",
    "Remote",
    "CDMX",
]

# ─── Scraping ───────────────────────────────────────────────────────────────
MAX_PAGINAS = 200

# Scrapers habilitados — pon False para desactivar sin borrar
SCRAPERS_ACTIVOS = {
    "occ": True,
    "computrabajo": True,
    "indeed_mx": True,
    "probecarios": True,
    "remoteok": True,
    "weworkremotely": True,
    "getonbrd": True,
    "wellfound": False,       # JS-heavy, deshabilitado por defecto
    "google_careers": True,
}
