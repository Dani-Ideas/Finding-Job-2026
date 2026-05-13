"use client";

interface Props {
  search: string;
  onSearch: (v: string) => void;
  modalidad: string;
  onModalidad: (v: string) => void;
  fuente: string;
  onFuente: (v: string) => void;
  fuentes: string[];
  total: number;
  filtered: number;
}

const MODALIDADES = ["all", "remoto", "híbrido", "presencial", "medio tiempo", "no especificado"];

export default function FilterBar({
  search, onSearch, modalidad, onModalidad, fuente, onFuente, fuentes, total, filtered,
}: Props) {
  return (
    <div className="flex items-center gap-2 px-4 py-1.5 border-b border-[#1a1a1a] bg-[#111] flex-shrink-0">
      <input
        type="text"
        placeholder="Buscar título, empresa..."
        value={search}
        onChange={(e) => onSearch(e.target.value)}
        className="bg-[#0e0e0e] border border-[#2a2a2a] text-[#f0ede6] text-xs px-3 py-1.5 w-56
                   focus:outline-none focus:border-[#e63946] placeholder:text-[#444] transition-colors"
      />
      <select
        value={modalidad}
        onChange={(e) => onModalidad(e.target.value)}
        className="bg-[#0e0e0e] border border-[#2a2a2a] text-[#aaa] text-xs px-2 py-1.5 focus:outline-none"
      >
        {MODALIDADES.map((m) => (
          <option key={m} value={m}>{m === "all" ? "Todas las modalidades" : m}</option>
        ))}
      </select>
      <select
        value={fuente}
        onChange={(e) => onFuente(e.target.value)}
        className="bg-[#0e0e0e] border border-[#2a2a2a] text-[#aaa] text-xs px-2 py-1.5 focus:outline-none"
      >
        <option value="all">Todas las fuentes</option>
        {fuentes.map((f) => (
          <option key={f} value={f}>{f}</option>
        ))}
      </select>
      <span className="text-[#444] text-[10px] ml-1">
        {filtered} / {total}
      </span>
    </div>
  );
}
