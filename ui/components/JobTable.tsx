"use client";

import type { Job } from "@/lib/types";
import { ExternalLink, FileText } from "lucide-react";

interface Props {
  jobs: Job[];
  selectedJob: Job | null;
  onSelect: (job: Job) => void;
  onGenerateCV: (job: Job) => void;
  isGenerating: boolean;
}

const MODAL_COLORS: Record<string, string> = {
  remoto: "bg-emerald-950 text-emerald-400",
  "híbrido": "bg-blue-950 text-blue-400",
  hibrido: "bg-blue-950 text-blue-400",
  presencial: "bg-orange-950 text-orange-400",
  "medio tiempo": "bg-purple-950 text-purple-400",
};

export default function JobTable({ jobs, selectedJob, onSelect, onGenerateCV, isGenerating }: Props) {
  if (!jobs.length) {
    return (
      <div className="flex items-center justify-center h-32 text-[#444] text-xs">
        Sin resultados
      </div>
    );
  }

  return (
    <table className="w-full text-xs border-collapse">
      <thead className="sticky top-0 z-10 bg-[#111]">
        <tr className="border-b border-[#1a1a1a]">
          <th className="text-left px-3 py-2 text-[#444] font-medium tracking-widest text-[9px] uppercase">Puesto / Empresa</th>
          <th className="text-left px-3 py-2 text-[#444] font-medium tracking-widest text-[9px] uppercase">Modalidad</th>
          <th className="text-left px-3 py-2 text-[#444] font-medium tracking-widest text-[9px] uppercase">Fuente</th>
          <th className="w-14 px-2 py-2" />
        </tr>
      </thead>
      <tbody>
        {jobs.map((job, i) => {
          const isSelected =
            selectedJob?.url === job.url && selectedJob?.titulo === job.titulo;
          const modalKey = (job.modalidad ?? "").toLowerCase();
          const modalColor = MODAL_COLORS[modalKey] ?? "bg-[#1a1a1a] text-[#666]";

          return (
            <tr
              key={`${job.url}-${i}`}
              onClick={() => onSelect(job)}
              className={`cursor-pointer border-b border-[#111] hover:bg-[#161616] transition-colors ${
                isSelected ? "bg-[#16162a] border-l-2 border-l-[#e63946]" : ""
              }`}
            >
              <td className="px-3 py-2 max-w-[220px]">
                <div className="text-[#f0ede6] truncate font-medium leading-5">{job.titulo}</div>
                <div className="text-[#555] text-[10px] truncate">{job.empresa}</div>
              </td>
              <td className="px-3 py-2 whitespace-nowrap">
                <span className={`text-[9px] px-1.5 py-0.5 font-medium ${modalColor}`}>
                  {job.modalidad || "—"}
                </span>
              </td>
              <td className="px-3 py-2 text-[#555] text-[10px] whitespace-nowrap">
                {job.fuente}
              </td>
              <td className="px-2 py-2">
                <div className="flex gap-0.5" onClick={(e) => e.stopPropagation()}>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Abrir oferta en el navegador"
                    className="p-1.5 text-[#444] hover:text-[#e63946] transition-colors"
                  >
                    <ExternalLink size={12} />
                  </a>
                  <button
                    onClick={() => { onSelect(job); onGenerateCV(job); }}
                    disabled={isGenerating}
                    title="Generar CV para esta oferta"
                    className="p-1.5 text-[#444] hover:text-[#60a5fa] disabled:opacity-30 transition-colors"
                  >
                    <FileText size={12} />
                  </button>
                </div>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
