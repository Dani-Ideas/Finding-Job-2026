export interface Job {
  titulo: string;
  empresa: string;
  ubicacion: string;
  modalidad: string;
  descripcion: string;
  url: string;
  fuente: string;
  fecha_publicacion: string;
  fecha_scraping: string;
}

export interface CsvFile {
  filename: string;
  date: string;
}

export interface AppConfig {
  roles: string[];
  modalidades: string[];
  ubicaciones: string[];
  scrapers: Record<string, boolean>;
  max_paginas: number;
}
