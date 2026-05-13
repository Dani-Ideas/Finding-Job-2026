"use client";

import { useState } from "react";
import type { Job } from "@/lib/types";

interface Props {
  job: Job;
}

export default function JobPanel({ job }: Props) {
  const [mode, setMode] = useState<"proxy" | "info">("proxy");

  const proxyUrl = job.url
    ? `/api/job-preview?url=${encodeURIComponent(job.url)}`
    : null;

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      {/* Job metadata */}
      <div className="px-3 py-2 border-b border-[#1a1a1a] bg-[#0a0a0a]">
        <div className="text-[#f0ede6] font-medium text-xs leading-5 truncate">{job.titulo}</div>
        <div className="text-[#666] text-[10px]">
          {job.empresa}
          {job.ubicacion ? ` · ${job.ubicacion}` : ""}
          {job.fecha_publicacion ? ` · ${job.fecha_publicacion}` : ""}
        </div>
      </div>

      {/* Mode toggle */}
      <div className="flex gap-1 px-3 py-1.5 border-b border-[#1a1a1a] bg-[#0e0e0e]">
        {(["proxy", "info"] as const).map((m) => (
          <button
            key={m}
            onClick={() => setMode(m)}
            className={`text-[10px] px-2 py-0.5 border transition-colors ${
              mode === m
                ? "border-[#e63946] text-[#e63946]"
                : "border-[#222] text-[#555] hover:text-[#888]"
            }`}
          >
            {m === "proxy" ? "Vista previa" : "Datos scrapeados"}
          </button>
        ))}
      </div>

      {mode === "proxy" && proxyUrl ? (
        <iframe
          key={proxyUrl}
          src={proxyUrl}
          className="flex-1 w-full bg-white"
          title="Job Preview"
          sandbox="allow-scripts allow-same-origin allow-forms"
        />
      ) : (
        <div className="flex-1 overflow-y-auto p-4 space-y-3 text-xs">
          <Field label="Título" value={job.titulo} />
          <Field label="Empresa" value={job.empresa} />
          <Field label="Ubicación" value={job.ubicacion} />
          <Field label="Modalidad" value={job.modalidad} />
          <Field label="Fuente" value={job.fuente} />
          <Field label="Publicado" value={job.fecha_publicacion} />
          <Field label="Scrapeado" value={job.fecha_scraping} />
          {job.descripcion && (
            <div>
              <div className="text-[#555] text-[9px] uppercase tracking-widest mb-1">Descripción</div>
              <p className="text-[#aaa] leading-relaxed whitespace-pre-wrap">{job.descripcion}</p>
            </div>
          )}
          {job.url && (
            <a
              href={job.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block mt-2 text-[#e63946] hover:underline"
            >
              Ver oferta completa →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  if (!value) return null;
  return (
    <div>
      <div className="text-[#444] text-[9px] uppercase tracking-widest mb-0.5">{label}</div>
      <div className="text-[#ccc]">{value}</div>
    </div>
  );
}
