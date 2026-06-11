"use client";

import { useState, useRef, useCallback } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faFileExcel,
  faFolderOpen,
  faTriangleExclamation,
  faCircleCheck,
  faCheck,
} from "@fortawesome/free-solid-svg-icons";

interface UploadResult {
  status: string;
  results: {
    created: number;
    updated: number;
    errors: string[];
  };
}

export default function MasterDataUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isExcel = (f: File) =>
    f.name.endsWith(".xlsx") ||
    f.name.endsWith(".xls") ||
    f.type.includes("spreadsheet") ||
    f.type.includes("excel");

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isExcel(dropped)) {
      setFile(dropped);
      setResult(null);
      setError(null);
    } else {
      setError("Bitte laden Sie eine gültige Excel-Datei hoch (.xlsx, .xls).");
    }
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected && isExcel(selected)) {
      setFile(selected);
      setResult(null);
      setError(null);
    } else if (selected) {
      setError("Bitte laden Sie eine gültige Excel-Datei hoch (.xlsx, .xls).");
    }
  };

  const handleUpload = () => {
    if (!file) return;
    setUploading(true);
    setProgress(0);
    setError(null);
    setResult(null);

    const formData = new FormData();
    formData.append("file", file);

    const xhr = new XMLHttpRequest();

    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 90));
      }
    };

    xhr.onload = () => {
      setProgress(100);
      try {
        const data: UploadResult = JSON.parse(xhr.responseText);
        if (xhr.status >= 200 && xhr.status < 300) {
          setResult(data);
        } else {
          setError("Upload fehlgeschlagen. Bitte versuchen Sie es erneut.");
        }
      } catch {
        setError("Ungültige Serverantwort.");
      }
      setUploading(false);
    };

    xhr.onerror = () => {
      setError("Netzwerkfehler. Bitte überprüfen Sie Ihre Verbindung.");
      setUploading(false);
    };

    xhr.open("POST", "/api/proxy/facility-master-data/");
    xhr.send(formData);
  };

  const handleReset = () => {
    setFile(null);
    setResult(null);
    setError(null);
    setProgress(0);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const dropZoneClass = [
    "border-2 border-dashed rounded-xl px-6 py-10 text-center transition-all duration-200 mb-6",
    isDragging
      ? "border-brand-500 bg-brand-50"
      : file
      ? "border-emerald-400 bg-emerald-50"
      : "border-gray-300 bg-gray-50 cursor-pointer",
  ].join(" ");

  return (
    <div className="flex justify-center w-full">
      <div className="bg-white rounded-2xl p-8 shadow-sm w-full max-w-2xl">
        <div
          onDragOver={(e) => {
            e.preventDefault();
            setIsDragging(true);
          }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleDrop}
          onClick={() => !file && fileInputRef.current?.click()}
          className={dropZoneClass}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".xlsx,.xls"
            onChange={handleFileChange}
            className="hidden"
          />

          {file ? (
            <div>
              <FontAwesomeIcon
                icon={faFileExcel}
                className="text-4xl text-emerald-600 mb-2.5"
              />
              <p className="m-0 mb-1 font-semibold text-emerald-800 text-sm mt-2">
                {file.name}
              </p>
              <p className="m-0 text-gray-500 text-xs">{formatBytes(file.size)}</p>
              {!uploading && !result && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleReset();
                  }}
                  className="mt-3 text-xs text-gray-500 bg-transparent border-none cursor-pointer underline p-0"
                >
                  Andere Datei wählen
                </button>
              )}
            </div>
          ) : (
            <div>
              <FontAwesomeIcon
                icon={faFolderOpen}
                className="text-4xl text-gray-400 mb-3"
              />
              <p className="m-0 mb-1.5 font-semibold text-gray-700 text-sm mt-2">
                Datei hier ablegen oder{" "}
                <span className="text-brand-500">klicken zum Auswählen</span>
              </p>
              <p className="m-0 text-gray-400 text-xs">
                Unterstützte Formate: .xlsx, .xls
              </p>
            </div>
          )}
        </div>

        {uploading && (
          <div className="mb-6">
            <div className="flex justify-between mb-1.5">
              <span className="text-[13px] text-gray-700 font-medium">
                Wird hochgeladen…
              </span>
              <span className="text-[13px] text-brand-500 font-semibold">
                {progress}%
              </span>
            </div>
            <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-brand-400 to-brand-600 transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border border-red-200 mb-5">
            <FontAwesomeIcon
              icon={faTriangleExclamation}
              className="text-base text-red-500 mt-0.5"
            />
            <p className="m-0 text-[13px] text-red-700">{error}</p>
          </div>
        )}

        {result && (
          <div className="p-5 rounded-xl bg-emerald-50 border border-emerald-200 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <FontAwesomeIcon
                icon={faCircleCheck}
                className="text-lg text-emerald-600"
              />
              <span className="font-bold text-emerald-900 text-sm">
                Import erfolgreich abgeschlossen
              </span>
            </div>

            <div className="flex gap-4">
              {[
                {
                  label: "Erstellt",
                  value: result.results.created,
                  className: "bg-green-100 text-green-700",
                },
                {
                  label: "Aktualisiert",
                  value: result.results.updated,
                  className: "bg-blue-100 text-blue-700",
                },
                {
                  label: "Fehler",
                  value: result.results.errors.length,
                  className: "bg-red-100 text-red-700",
                },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className={`flex-1 text-center px-2 py-3 rounded-xl ${stat.className}`}
                >
                  <div className="text-[26px] font-extrabold leading-none">
                    {stat.value}
                  </div>
                  <div className="text-xs text-gray-600 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>

            {result.results.errors.length > 0 && (
              <div className="mt-3.5">
                <p className="m-0 mb-2 text-xs font-semibold text-red-700">
                  Fehlerdetails:
                </p>
                <ul className="m-0 pl-4 text-xs text-red-600 space-y-1">
                  {result.results.errors.map((err, i) => (
                    <li key={i}>{err}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={handleReset}
            disabled={uploading}
            className="px-6 py-2.5 rounded-lg border border-gray-200 bg-white text-gray-700 font-semibold text-sm cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Stornieren
          </button>
          <button
            onClick={handleUpload}
            disabled={!file || uploading}
            className="px-6 py-2.5 rounded-lg border-0 bg-brand-500 hover:bg-brand-600 text-white font-semibold text-sm cursor-pointer disabled:bg-brand-300 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
          >
            {uploading ? (
              <>
                <span className="w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                Wird hochgeladen…
              </>
            ) : (
              <>
                <FontAwesomeIcon icon={faCheck} />
                Datei importieren
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
