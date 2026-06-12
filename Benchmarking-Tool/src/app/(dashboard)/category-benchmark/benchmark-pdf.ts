import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CategoryWideBenchmark } from "@/lib/types/benchmark";

const BRAND = {
  blue: [0, 79, 158] as [number, number, number],
  lightBlue: [240, 243, 246] as [number, number, number],
  black: [0, 0, 0] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  grey: [100, 116, 139] as [number, number, number],
  mutedGrey: [148, 163, 184] as [number, number, number], // slate-400 for help text
  lightGrey: [248, 250, 252] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  green: [22, 163, 74] as [number, number, number],
  red: [220, 38, 38] as [number, number, number],
  amber: [217, 119, 6] as [number, number, number],
};

const FONT = "helvetica";

/** Each label entry from the API — label + optional help_text + optional unit */
interface LabelEntry {
  label: string;
  help_text?: string;
  unit?: string;
}

/** Accept both plain strings (legacy) and LabelEntry objects */
function normaliseLabelEntry(entry: unknown): LabelEntry {
  if (typeof entry === "string") return { label: entry, help_text: "", unit: "" };
  if (
    entry &&
    typeof entry === "object" &&
    "label" in entry &&
    typeof (entry as LabelEntry).label === "string"
  ) {
    return entry as LabelEntry;
  }
  return { label: String(entry), help_text: "", unit: "" };
}

const KPI_SECTIONS: {
  key: keyof CategoryWideBenchmark["median"];
  label: string;
  accent: [number, number, number];
}[] = [
  { key: "occupancy_utilization",  label: "Belegung & Nutzung",                accent: [99, 102, 241] },
  { key: "revenue_kpis",           label: "Erlöskennzahlen",                   accent: [16, 185, 129] },
  { key: "cost_efficiency_kpis",   label: "Kosten & Effizienzkennzahlen",      accent: [245, 158, 11] },
  { key: "category_specific_kpis", label: "Kategorie-spezifische Kennzahlen",  accent: [168, 85, 247] },
  { key: "group_event_kpis",       label: "Gruppen & Veranstaltungen",         accent: [99, 102, 241] },
  { key: "personnel_area_kpis",    label: "Personalkosten je Bereich",         accent: [16, 185, 129] },
];

function fmt(value: number | undefined | null): string {
  if (value === null) return "nicht berechenbar";
  if (value === undefined || isNaN(value as number)) return "—";
  const v = value as number;
  if (Math.abs(v) >= 1_000_000) return (v / 1_000_000).toFixed(2) + "M";
  if (Math.abs(v) >= 1_000) return (v / 1_000).toFixed(2) + "k";
  if (!Number.isInteger(v) && v !== 0) return v.toFixed(2);
  return v.toLocaleString("de-DE");
}

function fmtWithUnit(value: number | undefined | null, unit?: string): string {
  const base = fmt(value);
  return unit && typeof value === "number" && isFinite(value) ? `${base} ${unit}` : base;
}

function delta(my: number | null, cat: number | null): string {
  if (my === null || cat === null || cat === 0) return "—";
  const pct = ((my - cat) / cat) * 100;
  if (Math.abs(pct) < 0.5) return "~ Gleichstand";
  return (pct > 0 ? "+ " : "- ") + Math.abs(pct).toFixed(2) + "%";
}

function deltaColor(my: number | null, cat: number | null): [number, number, number] {
  if (my === null || cat === null || cat === 0) return BRAND.grey;
  const pct = ((my - cat) / cat) * 100;
  if (Math.abs(pct) < 0.5) return BRAND.grey;
  return pct > 0 ? BRAND.green : BRAND.red;
}

function drawTitlePage(
  doc: jsPDF,
  facilityName: string,
  categoryName: string,
  year: number,
  logoDataUrl?: string
) {
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  doc.setFillColor(...BRAND.blue);
  doc.rect(0, 0, pw, 72, "F");

  doc.setFillColor(...BRAND.lightBlue);
  doc.rect(0, 72, pw, 5, "F");

  if (logoDataUrl) {
    try {
      const logoW = 70;
      const logoH = 18;
      doc.addImage(logoDataUrl, "PNG", (pw - logoW) / 2, 10, logoW, logoH);
    } catch {
      // ignore logo errors
    }
  }

  doc.setTextColor(...BRAND.white);
  doc.setFont(FONT, "bold");
  doc.setFontSize(24);
  doc.text("Kategorieweiter Benchmark", pw / 2, 38, { align: "center" });

  doc.setFont(FONT, "normal");
  doc.setFontSize(12);
  doc.text("Benchmark-Analysebericht", pw / 2, 50, { align: "center" });

  const cardY = 90;
  const cardH = 72;
  doc.setFillColor(...BRAND.lightBlue);
  doc.roundedRect(16, cardY, pw - 32, cardH, 4, 4, "F");
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.5);
  doc.roundedRect(16, cardY, pw - 32, cardH, 4, 4, "S");

  const labelX = 28;
  const valueX = 90;
  const rows = [
    ["Einrichtung:", facilityName],
    ["Kategorie:", categoryName],
    ["Jahr:", String(year)],
    ["Exportiert am:", new Date().toLocaleDateString("de-DE", { day: "2-digit", month: "long", year: "numeric" })],
  ];

  rows.forEach(([label, value], i) => {
    const y = cardY + 16 + i * 14;
    doc.setFont(FONT, "bold");
    doc.setFontSize(10);
    doc.setTextColor(...BRAND.grey);
    doc.text(label, labelX, y);
    doc.setFont(FONT, "normal");
    doc.setTextColor(...BRAND.black);
    doc.text(value, valueX, y);
  });

  doc.setFont(FONT, "normal");
  doc.setFontSize(10);
  doc.setTextColor(...BRAND.grey);
  const desc =
    "Dieser Bericht vergleicht alle KPI-Dimensionen der Einrichtung mit dem Kategorie-Benchmark " +
    "(Median, Durchschnitt, Min, Max). Die Tabellen enthalten eigene Werte, Kategorie-Referenzwerte " +
    "sowie Abweichungsindikatoren.";
  const lines = doc.splitTextToSize(desc, pw - 32);
  doc.text(lines, pw / 2, 182, { align: "center" });

  doc.setFontSize(8);
  doc.setTextColor(...BRAND.grey);
  doc.text(`Seite 1`, pw / 2, ph - 12, { align: "center" });
}

function drawSectionHeader(
  doc: jsPDF,
  label: string,
  accent: [number, number, number],
  y: number
): number {
  const pw = doc.internal.pageSize.getWidth();
  doc.setFillColor(...accent);
  doc.rect(16, y, 4, 10, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(12);
  doc.setTextColor(...BRAND.black);
  doc.text(label, 24, y + 7.5);
  doc.setDrawColor(...BRAND.border);
  doc.setLineWidth(0.3);
  doc.line(16, y + 13, pw - 16, y + 13);
  return y + 18;
}

function drawAggregationBlock(
  doc: jsPDF,
  aggLabel: string,
  benchmark: CategoryWideBenchmark,
  aggKey: keyof CategoryWideBenchmark,
  startY: number
): number {
  const pw = doc.internal.pageSize.getWidth();
  const aggData = benchmark[aggKey] as CategoryWideBenchmark["median"];

  doc.setFillColor(...BRAND.lightBlue);
  doc.rect(16, startY, pw - 32, 10, "F");
  doc.setFont(FONT, "bold");
  doc.setFontSize(9);
  doc.setTextColor(...BRAND.blue);
  doc.text(aggLabel.toUpperCase(), 20, startY + 7);
  let y = startY + 14;

  KPI_SECTIONS.forEach((section) => {
    const sectionData = aggData[section.key] as {
      labels: unknown[];
      my_data: (number | null)[];
      category_data: (number | null)[];
      q1?: number[];
      q3?: number[];
      participant_count?: number[];
      min_values?: number[];
      max_values?: number[];
      facility_values?: Record<string, number[]>;
    } | undefined;

    // V2 sections (group/event, personnel) are absent for cat.3 + cat.4.
    if (!sectionData) return;

    const rawLabels: unknown[] = sectionData.labels ?? [];
    if (rawLabels.length === 0) return;

    // Normalise to LabelEntry[]
    const labelEntries: LabelEntry[] = rawLabels.map(normaliseLabelEntry);

    const { my_data, category_data, q1, q3, participant_count, min_values, max_values } =
      sectionData;

    y = drawSectionHeader(doc, section.label, section.accent, y);

    const hasQ1Q3  = q1 && q3;
    const hasMinMax = min_values && max_values;
    const hasCount  = !!participant_count;

    const head: string[] = ["Metrik", "Eigener Wert", `Kategorie (${aggLabel})`];
    if (hasQ1Q3)  head.push("Q1 (25%)", "Q3 (75%)");
    if (hasMinMax) head.push("Min", "Max");
    if (hasCount)  head.push("Teilnehmer");
    head.push("Abweichung");

    const deltaColIdx = head.length - 1;

    const body = labelEntries.map((entry, i) => {
      const my  = my_data[i]  ?? null;
      const cat = category_data[i] ?? null;
      const unit = entry.unit ?? "";
      const row: string[] = [entry.label, fmtWithUnit(my, unit), fmtWithUnit(cat, unit)];
      if (hasQ1Q3)  row.push(fmtWithUnit(q1![i], unit), fmtWithUnit(q3![i], unit));
      if (hasMinMax) row.push(fmtWithUnit(min_values![i], unit), fmtWithUnit(max_values![i], unit));
      if (hasCount)  row.push(String(participant_count![i] ?? "—"));
      row.push(delta(my, cat));
      return row;
    });

    const deltaColWidth  = 26;
    const metricColWidth = 46;

    const dynamicColStyles: Record<number, object> = {
      0: { fontStyle: "bold", cellWidth: metricColWidth, overflow: "linebreak" },
      1: { halign: "right", fontStyle: "bold", cellWidth: "auto" },
      2: { halign: "right", cellWidth: "auto" },
      [deltaColIdx]: {
        halign: "right",
        fontStyle: "bold",
        cellWidth: deltaColWidth,
        overflow: "linebreak",
      },
    };

    let extraCol = 3;
    if (hasQ1Q3) {
      dynamicColStyles[extraCol]     = { halign: "right", cellWidth: 18 };
      dynamicColStyles[extraCol + 1] = { halign: "right", cellWidth: 18 };
      extraCol += 2;
    }
    if (hasMinMax) {
      dynamicColStyles[extraCol]     = { halign: "right", cellWidth: 16 };
      dynamicColStyles[extraCol + 1] = { halign: "right", cellWidth: 16 };
      extraCol += 2;
    }
    if (hasCount) {
      dynamicColStyles[extraCol] = { halign: "center", cellWidth: 18 };
    }

    autoTable(doc, {
      startY: y,
      head: [head],
      body,
      margin: { left: 16, right: 16 },
      tableWidth: "auto",
      styles: {
        font: FONT,
        fontSize: 8.5,
        cellPadding: { top: 3, bottom: 3, left: 4, right: 4 },
        lineColor: BRAND.border,
        lineWidth: 0.2,
        textColor: BRAND.black,
        overflow: "linebreak",
        // Extra bottom padding on metric column to leave room for help_text line
        minCellHeight: 14,
      },
      headStyles: {
        fillColor: BRAND.blue,
        textColor: BRAND.white,
        fontStyle: "bold",
        fontSize: 8,
        overflow: "linebreak",
      },
      alternateRowStyles: {
        fillColor: BRAND.lightGrey,
      },
      columnStyles: dynamicColStyles,

      didParseCell(data) {
        // Colour the delta column
        if (data.section === "body" && data.column.index === deltaColIdx) {
          const rowIdx = data.row.index;
          const my  = my_data[rowIdx]  ?? null;
          const cat = category_data[rowIdx] ?? null;
          const [r, g, b] = deltaColor(my, cat);
          data.cell.styles.textColor = [r, g, b];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.halign = "right";
        }
      },

      didDrawCell(data) {
        // After the metric label is drawn, paint the help_text below it
        if (
          data.section === "body" &&
          data.column.index === 0
        ) {
          const entry = labelEntries[data.row.index];
          const helpText = entry?.help_text?.trim();
          if (!helpText) return;

          const maxWidth = data.cell.width - 8; // respect cell padding
          const wrapped  = doc.splitTextToSize(helpText, maxWidth);

          doc.setFont(FONT, "normal");
          doc.setFontSize(6.5);
          doc.setTextColor(...BRAND.mutedGrey);

          // Position: just below the label text baseline
          // cell.y + top-padding + label line height (~4.5 mm at 8.5pt) + small gap
          const textY = data.cell.y + data.cell.padding("top") + 4.5 + 1.5;

          // Only render first two wrapped lines so it stays within the cell
          const linesToShow = wrapped.slice(0, 2) as string[];
          linesToShow.forEach((line: string, li: number) => {
            doc.text(line, data.cell.x + data.cell.padding("left"), textY + li * 3);
          });

          // Reset font so subsequent cells are unaffected
          doc.setFont(FONT, "normal");
          doc.setFontSize(8.5);
          doc.setTextColor(...BRAND.black);
        }
      },
    });

    y = (doc as any).lastAutoTable.finalY + 10;
  });

  return y;
}

export async function exportBenchmarkPdf({
  facilityName,
  categoryName,
  year,
  benchmark,
  logoUrl,
}: {
  facilityName: string;
  categoryName: string;
  year: number;
  benchmark: CategoryWideBenchmark;
  logoUrl?: string;
}): Promise<void> {
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pw = doc.internal.pageSize.getWidth();
  const ph = doc.internal.pageSize.getHeight();

  let logoDataUrl: string | undefined;
  if (logoUrl) {
    try {
      const res  = await fetch(logoUrl);
      const blob = await res.blob();
      logoDataUrl = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload  = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch {
      // Logo fetch failed — continue without logo
    }
  }

  drawTitlePage(doc, facilityName, categoryName, year, logoDataUrl);

  const addFooter = (pageNum: number) => {
    doc.setFont(FONT, "normal");
    doc.setFontSize(8);
    doc.setTextColor(...BRAND.grey);
    doc.text(`${facilityName} — Kategorieweiter Benchmark ${year}`, 16, ph - 10);
    doc.text(`Seite ${pageNum}`, pw - 16, ph - 10, { align: "right" });
    doc.setDrawColor(...BRAND.border);
    doc.setLineWidth(0.3);
    doc.line(16, ph - 14, pw - 16, ph - 14);
  };

  const aggregations: { key: keyof CategoryWideBenchmark; label: string }[] = [
    { key: "median",  label: "Median" },
    { key: "average", label: "Durchschnitt" },
    { key: "min",     label: "Minimum" },
    { key: "max",     label: "Maximum" },
  ];

  let pageNum = 2;

  for (const agg of aggregations) {
    if (!benchmark[agg.key]) continue;

    doc.addPage();
    addFooter(pageNum);
    pageNum++;

    doc.setFillColor(...BRAND.blue);
    doc.rect(0, 0, pw, 22, "F");
    doc.setFont(FONT, "bold");
    doc.setFontSize(14);
    doc.setTextColor(...BRAND.white);
    doc.text(`${agg.label} — Benchmark-Vergleich`, pw / 2, 14, { align: "center" });

    drawAggregationBlock(doc, agg.label, benchmark, agg.key, 28);
  }

  doc.setPage(1);
  doc.setFont(FONT, "normal");
  doc.setFontSize(8);
  doc.setTextColor(...BRAND.grey);
  doc.text(`Kategorieweiter Benchmark — ${categoryName} — ${year}`, 16, ph - 10);
  doc.text(`Seite 1`, pw - 16, ph - 10, { align: "right" });

  const safeFilename = `benchmark_${facilityName.replace(/\s+/g, "_")}_${year}.pdf`;
  doc.save(safeFilename);
}
