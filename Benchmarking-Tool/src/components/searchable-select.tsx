"use client";

import { useState, useEffect, useRef } from "react";

export default function SearchableSelect({
  name,
  value,
  placeholder,
  options,
  onChange,
  error = false,
  mode = "light"
}: {
  name: string;
  value?: string | number;
  placeholder?: string;
  options: {
    label: string;
    value: string;
  }[],
  onChange?: (name: string, value: string) => void;
  error?: boolean;
  mode?: "light" | "dark";
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<typeof options[number] | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    if (!value) {
      setSelected(null);
      return;
    }
    const match = options.find((o) => o.value === String(value));
    setSelected(match ?? null);
  }, [value, options]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && ! ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <input type="hidden" name={name} value={selected?.value ?? ""} />

      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={
          `w-full flex items-center justify-between px-4 py-3 rounded-lg
           ${mode === "dark" ? "bg-slate-800/50 text-white" : ""}
           border ${error ? 'border-red-400' : mode === 'light' ? 'border-slate-300' : 'border-slate-700'}
           focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary`
        }
      >
        <span className={mode === "dark" && selected ? "text-white" : selected ? "text-black" : mode === "light" ? "text-slate-400" : "text-slate-500"}>
          {selected ? selected.label : placeholder}
        </span>

        <svg
          className={`w-4 h-4 transition ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div className={`absolute z-10 mt-2 w-full rounded-lg border ${mode === "dark" ? "bg-slate-900 border-slate-700" : "bg-white border-slate-300"} shadow-lg`}>
          <div className="p-2">
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className={`w-full px-3 py-2 rounded-md border
              ${mode === "dark" ?
                "bg-slate-800 border-slate-700 text-white placeholder-slate-500"
                : `bg-white border-slate-300 text-black placeholder-slate-400`
              } 
               focus:outline-none`}
            />
          </div>

          <div className="max-h-48 overflow-y-auto">
            {filteredOptions.length > 0 ? (
              filteredOptions.map(option => (
                <div
                  key={option.value}
                  onClick={() => {
                    setSelected(option);
                    onChange?.(name, option.value);
                    setOpen(false);
                    setSearch("");
                  }}
                  className={`px-4 py-2 text-sm cursor-pointer
                    ${
                    value === option.value ||
                    selected?.value === option.value
                      ? "bg-primary text-white"
                      : mode === "dark" ? "text-slate-300 hover:bg-slate-800" : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {option.label}
                </div>
              ))
            ) : (
                <div className={`px-4 py-2 text-sm ${mode === "dark" ? "text-slate-500" : "text-slate-900"}`}>
                No results found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
