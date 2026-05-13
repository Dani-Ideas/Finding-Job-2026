"use client";

import { useState, useEffect } from "react";
import type { AppConfig } from "@/lib/types";
import { X, Plus, Trash2, Power } from "lucide-react";

interface Props {
  onClose: () => void;
}

type Tab = "roles" | "modalidades" | "ubicaciones" | "scrapers";
type ListField = "roles" | "modalidades" | "ubicaciones";

export default function ConfigDrawer({ onClose }: Props) {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [tab, setTab] = useState<Tab>("roles");
  const [newItem, setNewItem] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    fetch("/api/config")
      .then((r) => r.json())
      .then(setConfig);
  }, []);

  // reset input on tab change
  useEffect(() => { setNewItem(""); }, [tab]);

  const save = async () => {
    if (!config) return;
    setSaving(true);
    await fetch("/api/config", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(config),
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => { setSaved(false); onClose(); }, 800);
  };

  const addItem = (field: ListField) => {
    const val = newItem.trim();
    if (!val || !config) return;
    if (config[field].includes(val)) return;
    setConfig({ ...config, [field]: [...config[field], val] });
    setNewItem("");
  };

  const removeItem = (field: ListField, idx: number) => {
    if (!config) return;
    setConfig({ ...config, [field]: config[field].filter((_, i) => i !== idx) });
  };

  const toggleScraper = (name: string) => {
    if (!config) return;
    setConfig({ ...config, scrapers: { ...config.scrapers, [name]: !config.scrapers[name] } });
  };

  const TABS: { key: Tab; label: string; count: number | string }[] = config
    ? [
        { key: "roles", label: "Roles", count: config.roles.length },
        { key: "modalidades", label: "Modalidades", count: config.modalidades.length },
        { key: "ubicaciones", label: "Ubicaciones", count: config.ubicaciones.length },
        {
          key: "scrapers",
          label: "Scrapers",
          count: `${Object.values(config.scrapers).filter(Boolean).length}/${Object.keys(config.scrapers).length}`,
        },
      ]
    : [];

  const renderList = (field: ListField) => (
    <div className="space-y-1">
      {config![field].map((item, i) => (
        <div key={i} className="flex items-center gap-2 px-3 py-1.5 bg-[#161616] group">
          <span className="flex-1 text-[#ccc] text-xs">{item}</span>
          <button
            onClick={() => removeItem(field, i)}
            className="text-[#2a2a2a] hover:text-[#e63946] opacity-0 group-hover:opacity-100 transition-all"
          >
            <Trash2 size={11} />
          </button>
        </div>
      ))}
      <div className="flex gap-2 mt-3">
        <input
          value={newItem}
          onChange={(e) => setNewItem(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && addItem(field)}
          placeholder={`Nuevo ${field.slice(0, -1)}...`}
          className="flex-1 bg-[#0e0e0e] border border-[#2a2a2a] text-[#f0ede6] text-xs px-3 py-2
                     focus:outline-none focus:border-[#e63946] placeholder:text-[#333] transition-colors"
        />
        <button
          onClick={() => addItem(field)}
          className="px-3 py-2 bg-[#e63946] hover:bg-[#c5303c] text-white transition-colors"
        >
          <Plus size={13} />
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex justify-end" onClick={onClose}>
      <div
        className="w-[400px] h-full bg-[#111] border-l border-[#1a1a1a] flex flex-col shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#1a1a1a]">
          <span className="text-[#f0ede6] text-sm font-medium tracking-wide">Configuración</span>
          <button onClick={onClose} className="text-[#444] hover:text-[#f0ede6] transition-colors">
            <X size={16} />
          </button>
        </div>

        {!config ? (
          <div className="flex-1 flex items-center justify-center text-[#555] text-xs">
            Cargando…
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="flex border-b border-[#1a1a1a]">
              {TABS.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setTab(key)}
                  className={`flex-1 py-2 text-[9px] uppercase tracking-widest transition-colors ${
                    tab === key
                      ? "text-[#e63946] border-b-2 border-[#e63946]"
                      : "text-[#444] hover:text-[#888]"
                  }`}
                >
                  {label}
                  <span className="ml-1 text-[#333]">({count})</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-4">
              {tab === "roles" && renderList("roles")}
              {tab === "modalidades" && renderList("modalidades")}
              {tab === "ubicaciones" && renderList("ubicaciones")}
              {tab === "scrapers" && (
                <div className="space-y-1.5">
                  {Object.entries(config.scrapers).map(([name, active]) => (
                    <div key={name} className="flex items-center justify-between px-3 py-2.5 bg-[#161616]">
                      <span className={`text-xs font-medium ${active ? "text-[#f0ede6]" : "text-[#444]"}`}>
                        {name}
                      </span>
                      <button
                        onClick={() => toggleScraper(name)}
                        className={`transition-colors ${active ? "text-emerald-400" : "text-[#2a2a2a]"} hover:scale-110`}
                        title={active ? "Desactivar" : "Activar"}
                      >
                        <Power size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-4 py-3 border-t border-[#1a1a1a]">
              <button
                onClick={save}
                disabled={saving || saved}
                className="w-full py-2.5 bg-[#e63946] hover:bg-[#c5303c] disabled:opacity-60
                           text-white text-xs font-medium uppercase tracking-widest transition-colors"
              >
                {saved ? "✓ Guardado" : saving ? "Guardando…" : "Guardar configuración"}
              </button>
              <p className="text-[#333] text-[9px] text-center mt-2">
                Los cambios se aplican en el siguiente scraping
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
