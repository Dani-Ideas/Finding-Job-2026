from abc import ABC, abstractmethod
from playwright.async_api import async_playwright, Browser, Page
from models import Job


class BaseScraper(ABC):
    """Clase base para todos los scrapers. Maneja el ciclo de vida de Playwright."""

    nombre: str = "base"

    def __init__(self, roles: list[str], ubicacion: str, max_paginas: int = 5):
        self.roles = roles
        self.ubicacion = ubicacion
        self.max_paginas = max_paginas

    async def scrape(self) -> list[Job]:
        """Punto de entrada. Abre el navegador, corre la logica y cierra."""
        jobs: list[Job] = []
        async with async_playwright() as p:
            browser: Browser = await p.chromium.launch(headless=True)
            page: Page = await browser.new_page()
            await page.set_extra_http_headers(
                {
                    "User-Agent": (
                        "Mozilla/5.0 (X11; Linux x86_64) "
                        "AppleWebKit/537.36 (KHTML, like Gecko) "
                        "Chrome/124.0.0.0 Safari/537.36"
                    )
                }
            )
            try:
                jobs = await self._scrape(page)
            finally:
                await browser.close()
        return jobs

    @abstractmethod
    async def _scrape(self, page: "Page") -> list[Job]:
        """Implementar en cada subclase."""
        ...

    def detectar_modalidad(self, texto: str) -> str:
        t = texto.lower()
        if "remoto" in t or "home office" in t or "remote" in t or "teletrabajo" in t:
            return "remoto"
        if "híbrido" in t or "hibrido" in t or "hybrid" in t:
            return "híbrido"
        if "medio tiempo" in t or "part time" in t or "part-time" in t or "medio-tiempo" in t:
            return "medio tiempo"
        if "presencial" in t or "on-site" in t or "onsite" in t:
            return "presencial"
        return "no especificado"
