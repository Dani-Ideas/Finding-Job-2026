"use client";

interface Props {
  html: string;
  isLoading: boolean;
  jobTitulo?: string;
}

export default function CvPanel({ html, isLoading, jobTitulo }: Props) {
  const handlePrint = () => {
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(html);
    win.document.close();
    win.focus();
    setTimeout(() => win.print(), 500);
  };

  if (isLoading) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#555]">
        <div className="w-4 h-4 border-2 border-[#e63946] border-t-transparent rounded-full animate-spin" />
        <span className="text-xs">Generando CV…</span>
      </div>
    );
  }

  if (!html) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center gap-2 text-[#333] select-none">
        <FileTextIcon />
        <span className="text-xs">CV no generado</span>
        {jobTitulo && (
          <span className="text-[10px] text-[#222] max-w-[200px] text-center">
            Haz clic en <span className="text-[#e63946]">Generar CV</span> para adaptar el CV a esta oferta
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 overflow-hidden">
      <div className="flex gap-2 items-center px-3 py-1.5 border-b border-[#1a1a1a] bg-[#0e0e0e]">
        <button
          onClick={handlePrint}
          className="text-[10px] px-3 py-1 border border-[#2a2a2a] text-[#888]
                     hover:border-[#e63946] hover:text-[#e63946] transition-colors"
        >
          Imprimir / PDF
        </button>
        <span className="text-[#333] text-[10px] ml-auto">← CV adaptado a la oferta</span>
      </div>
      <iframe
        srcDoc={html}
        className="flex-1 w-full bg-white"
        title="CV Preview"
        sandbox="allow-same-origin"
      />
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#333" strokeWidth="1.5">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  );
}
