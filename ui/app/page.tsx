"use client";

import { useState, useEffect, useCallback } from "react";
import type { Job, CsvFile } from "@/lib/types";
import JobTable from "@/components/JobTable";
import CvPanel from "@/components/CvPanel";
import JobPanel from "@/components/JobPanel";
import ConfigDrawer from "@/components/ConfigDrawer";
import FilterBar from "@/components/FilterBar";
import { Settings2, RefreshCw } from "lucide-react";

export default function Home() {
  const [csvFiles, setCsvFiles] = useState<CsvFile[]>([]);
  const [selectedCsv, setSelectedCsv] = useState("");
  const [jobs, setJobs] = useState<Job[]>([]);
  const [filtered, setFiltered] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [cvHtml, setCvHtml] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(false);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [modalidadFilter, setModalidadFilter] = useState("all");
  const [fuenteFilter, setFuenteFilter] = useState("all");

  // Cargar lista de CSVs al inicio
  useEffect(() => {
    fetch("/api/csvs")
      .then((r) => r.json())
      .then((data: CsvFile[]) => {
        setCsvFiles(data);
        if (data.length) setSelectedCsv(data[0].filename);
      });
  }, []);

  // Cargar jobs cuando cambia el CSV seleccionado
  useEffect(() => {
    if (!selectedCsv) return;
    setLoading(true);
    setSelectedJob(null);
    setCvHtml("");
    fetch(`/api/jobs?csv=${selectedCsv}`)
      .then((r) => r.json())
      .then((data: Job[]) => { setJobs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedCsv]);

  // Aplicar filtros
  useEffect(() => {
    let result = jobs;
    if (search.trim()) {
      const s = search.toLowerCase();
      result = result.filter(
        (j) =>
          j.titulo?.toLowerCase().includes(s) ||
          j.empresa?.toLowerCase().includes(s) ||
          j.descripcion?.toLowerCase().includes(s)
      );
    }
    if (modalidadFilter !== "all") {
      result = result.filter((j) =>
        (j.modalidad ?? "").toLowerCase().includes(modalidadFilter)
      );
    }
    if (fuenteFilter !== "all") {
      result = result.filter((j) => j.fuente === fuenteFilter);
    }
    setFiltered(result);
  }, [jobs, search, modalidadFilter, fuenteFilter]);

  const handleSelect = useCallback((job: Job) => {
    setSelectedJob(job);
    setCvHtml("");
  }, []);

  const handleGenerateCV = useCallback(async (job: Job) => {
    setIsGenerating(true);
    setSelectedJob(job);
    setCvHtml("");
    try {
      const res = await fetch("/api/cv", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ titulo: job.titulo, descripcion: job.descripcion ?? "" }),
      });
      const data = await res.json();
      setCvHtml(data.html ?? "");
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const fuentes = [...new Set(jobs.map((j) => j.fuente).filter(Boolean))];
  const showDetail = selectedJob !== null;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#0e0e0e] text-[#f0ede6]">

      {/* ── TOP BAR ─────────────────────────────────────────────── */}
      <header className="flex items-center gap-3 px-4 py-2 border-b border-[#1a1a1a] bg-[#111] flex-shrink-0">
        <span className="text-[#e63946] text-xs font-bold tracking-[0.25em] uppercase select-none">
          Job Scraper
        </span>
        <div className="h-4 w-px bg-[#2a2a2a]" />
        <select
          value={selectedCsv}
          onChange={(e) => setSelectedCsv(e.target.value)}
          className="bg-[#0e0e0e] border border-[#2a2a2a] text-[#ccc] text-xs px-2 py-1
                     focus:outline-none focus:border-[#e63946] transition-colors"
        >
          {csvFiles.map((f) => (
            <option key={f.filename} value={f.filename}>{f.date}</option>
          ))}
        </select>
        <div className="flex-1" />
        <button
          onClick={() => setShowConfig(true)}
          className="flex items-center gap-1.5 text-[10px] px-3 py-1.5 border border-[#2a2a2a]
                     text-[#888] hover:border-[#e63946] hover:text-[#e63946] transition-colors uppercase tracking-widest"
        >
          <Settings2 size={12} />
          Config
        </button>
      </header>

      {/* ── FILTER BAR ──────────────────────────────────────────── */}
      <FilterBar
        search={search} onSearch={setSearch}
        modalidad={modalidadFilter} onModalidad={setModalidadFilter}
        fuente={fuenteFilter} onFuente={setFuenteFilter}
        fuentes={fuentes}
        total={jobs.length} filtered={filtered.length}
      />

      {/* ── MAIN ────────────────────────────────────────────────── */}
      <div className="flex flex-1 overflow-hidden">

        {/* JOB TABLE */}
        <div
          className={`flex-shrink-0 overflow-y-auto border-r border-[#1a1a1a] transition-all duration-200 ${
            showDetail ? "w-[360px]" : "flex-1"
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center h-32 gap-2 text-[#444] text-xs">
              <RefreshCw size={13} className="animate-spin" />
              Cargando…
            </div>
          ) : (
            <JobTable
              jobs={filtered}
              selectedJob={selectedJob}
              onSelect={handleSelect}
              onGenerateCV={handleGenerateCV}
              isGenerating={isGenerating}
            />
          )}
        </div>

        {/* DETAIL SPLIT VIEW */}
        {showDetail ? (
          <div className="flex flex-1 overflow-hidden">

            {/* CV — izquierda */}
            <div className="flex flex-col flex-1 overflow-hidden border-r border-[#1a1a1a]">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a] bg-[#0a0a0a] flex-shrink-0">
                <span className="text-[9px] text-[#444] uppercase tracking-widest">CV generado</span>
                {!cvHtml && !isGenerating && (
                  <button
                    onClick={() => handleGenerateCV(selectedJob!)}
                    className="text-[10px] px-3 py-1 bg-[#e63946] hover:bg-[#c5303c] text-white transition-colors"
                  >
                    Generar CV →
                  </button>
                )}
                {cvHtml && !isGenerating && (
                  <button
                    onClick={() => handleGenerateCV(selectedJob!)}
                    className="text-[10px] px-2 py-1 border border-[#2a2a2a] text-[#555]
                               hover:border-[#e63946] hover:text-[#e63946] transition-colors"
                  >
                    Regenerar
                  </button>
                )}
              </div>
              <CvPanel html={cvHtml} isLoading={isGenerating} jobTitulo={selectedJob?.titulo} />
            </div>

            {/* JOB PREVIEW — derecha */}
            <div className="flex flex-col flex-1 overflow-hidden">
              <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#1a1a1a] bg-[#0a0a0a] flex-shrink-0">
                <span className="text-[9px] text-[#444] uppercase tracking-widest truncate max-w-[200px]">
                  {selectedJob?.empresa}
                </span>
                <a
                  href={selectedJob?.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[10px] px-3 py-1 border border-[#e63946] text-[#e63946]
                             hover:bg-[#e63946] hover:text-white transition-colors whitespace-nowrap"
                >
                  Abrir en Browser →
                </a>
              </div>
              <JobPanel job={selectedJob!} />
            </div>

          </div>
        ) : (
          !loading && (
            <div className="flex-1 flex items-center justify-center text-[#2a2a2a] text-xs select-none">
              ← Selecciona una oferta
            </div>
          )
        )}
      </div>

      {showConfig && <ConfigDrawer onClose={() => setShowConfig(false)} />}
    </div>
  );
}
