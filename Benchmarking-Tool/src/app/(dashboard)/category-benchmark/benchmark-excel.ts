import ExcelJS from "exceljs";
import { CategoryWideBenchmark } from "@/lib/types/benchmark";

const C = {
  blue:       "FF004F9E",
  lightBlue:  "FFF0F3F6",
  black:      "FF000000",
  white:      "FFFFFFFF",
  grey:       "FF64748B",
  mutedGrey:  "FF94A3B8", // slate-400 — for help_text second line
  lightGrey:  "FFF8FAFC",
  border:     "FFE2E8F0",
  green:      "FF16A34A",
  red:        "FFDC2626",
  amber:      "FFD97706",
  brand:      "FF6366F1",
  emerald:    "FF10B981",
  amberLight: "FFF59E0B",
  purple:     "FFA855F7",
};

const KPI_SECTIONS: {
  key: keyof CategoryWideBenchmark["median"];
  label: string;
  tabColor: string;
}[] = [
  { key: "occupancy_utilization",  label: "Belegung & Nutzung",                tabColor: C.brand },
  { key: "revenue_kpis",           label: "Erlöskennzahlen",                   tabColor: C.emerald },
  { key: "cost_efficiency_kpis",   label: "Kosten & Effizienzkennzahlen",      tabColor: C.amberLight },
  { key: "category_specific_kpis", label: "Kategorie-spezifische Kennzahlen",  tabColor: C.purple },
];

// ─── LabelEntry ───────────────────────────────────────────────────────────────

interface LabelEntry {
  label: string;
  help_text?: string;
  unit?: string;
}

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

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtNum(value: number | undefined | null): number | string {
  if (value === undefined || value === null || isNaN(value as number)) return "—";
  return value as number;
}

/**
 * Returns a string with unit appended when a unit is provided,
 * otherwise returns the raw number (for native Excel formatting).
 */
function fmtWithUnit(value: number | undefined | null, unit?: string): number | string {
  const base = fmtNum(value);
  if (unit && base !== "—") return `${base} ${unit}`;
  return base;
}

function deltaText(my: number, cat: number): string {
  if (cat === 0) return "—";
  const pct = ((my - cat) / cat) * 100;
  if (Math.abs(pct) < 0.5) return "≈ Parity";
  return (pct > 0 ? "▲ " : "▼ ") + Math.abs(pct).toFixed(1) + "%";
}

function deltaFill(my: number, cat: number): string {
  if (cat === 0) return C.lightGrey;
  const pct = ((my - cat) / cat) * 100;
  if (Math.abs(pct) < 0.5) return C.lightGrey;
  return pct > 0 ? "FFD1FAE5" : "FFFEE2E2";
}

function deltaFontColor(my: number, cat: number): string {
  if (cat === 0) return C.grey;
  const pct = ((my - cat) / cat) * 100;
  if (Math.abs(pct) < 0.5) return C.grey;
  return pct > 0 ? C.green : C.red;
}

function headerStyle(
  fill: string,
  fontColor: string = C.white,
  bold = true
): Partial<ExcelJS.Style> {
  return {
    font: { name: "Calibri", bold, color: { argb: fontColor }, size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: fill } },
    alignment: { vertical: "middle", horizontal: "center", wrapText: true },
    border: {
      top:    { style: "thin", color: { argb: C.border } },
      bottom: { style: "thin", color: { argb: C.border } },
      left:   { style: "thin", color: { argb: C.border } },
      right:  { style: "thin", color: { argb: C.border } },
    },
  };
}

function cellStyle(
  fill: string,
  fontColor: string = C.black,
  bold = false,
  align: "left" | "right" | "center" = "right"
): Partial<ExcelJS.Style> {
  return {
    font: { name: "Calibri", bold, color: { argb: fontColor }, size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: fill } },
    alignment: { vertical: "middle", horizontal: align },
    border: {
      top:    { style: "thin", color: { argb: C.border } },
      bottom: { style: "thin", color: { argb: C.border } },
      left:   { style: "thin", color: { argb: C.border } },
      right:  { style: "thin", color: { argb: C.border } },
    },
    numFmt: "#,##0.###",
  };
}

// ─── Cover sheet ──────────────────────────────────────────────────────────────

function addCoverSheet(
  wb: ExcelJS.Workbook,
  facilityName: string,
  categoryName: string,
  year: number
) {
  const ws = wb.addWorksheet("Deckblatt", { properties: { tabColor: { argb: C.blue } } });
  ws.columns = [{ width: 26 }, { width: 48 }];

  ws.mergeCells("A1:B1");
  const titleCell = ws.getCell("A1");
  titleCell.value = "Kategorieweiter Benchmark";
  titleCell.style = {
    font: { name: "Calibri", bold: true, color: { argb: C.white }, size: 20 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: C.blue } },
    alignment: { vertical: "middle", horizontal: "center" },
  };
  ws.getRow(1).height = 48;

  ws.mergeCells("A2:B2");
  const subtitleCell = ws.getCell("A2");
  subtitleCell.value = "Benchmark-Analysebericht";
  subtitleCell.style = {
    font: { name: "Calibri", italic: true, color: { argb: C.white }, size: 13 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: C.blue } },
    alignment: { vertical: "middle", horizontal: "center" },
  };
  ws.getRow(2).height = 28;
  ws.getRow(3).height = 10;

  const infoRows: [string, string][] = [
    ["Einrichtung", facilityName],
    ["Kategorie", categoryName],
    ["Jahr", String(year)],
    [
      "Exportiert am",
      new Date().toLocaleDateString("de-DE", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      }),
    ],
  ];

  infoRows.forEach(([label, value], i) => {
    const rowNum = 4 + i;
    const row = ws.getRow(rowNum);
    row.height = 22;
    const lCell = ws.getCell(`A${rowNum}`);
    lCell.value = label;
    lCell.style = headerStyle(C.lightBlue, C.black);
    const vCell = ws.getCell(`B${rowNum}`);
    vCell.value = value;
    vCell.style = cellStyle(C.white, C.black, true, "left");
  });

  ws.getRow(9).height = 12;

  ws.mergeCells("A10:B10");
  const descCell = ws.getCell("A10");
  descCell.value =
    "Dieser Bericht vergleicht alle KPI-Dimensionen der ausgewählten Einrichtung mit dem " +
    "Kategorie-Benchmark (Median, Durchschnitt, Min, Max). Jedes Tabellenblatt enthält eigene Werte, " +
    "Kategorie-Referenzwerte sowie Abweichungsindikatoren.";
  descCell.style = {
    font: { name: "Calibri", color: { argb: C.grey }, size: 10 },
    fill: { type: "pattern", pattern: "solid", fgColor: { argb: C.lightBlue } },
    alignment: { vertical: "middle", horizontal: "left", wrapText: true },
    border: {
      top:    { style: "thin", color: { argb: C.border } },
      bottom: { style: "thin", color: { argb: C.border } },
      left:   { style: "thin", color: { argb: C.border } },
      right:  { style: "thin", color: { argb: C.border } },
    },
  };
  ws.getRow(10).height = 52;
}

// ─── KPI sheet ────────────────────────────────────────────────────────────────

function addKpiSheet(
  wb: ExcelJS.Workbook,
  sectionKey: keyof CategoryWideBenchmark["median"],
  sectionLabel: string,
  tabColor: string,
  facilityName: string,
  benchmark: CategoryWideBenchmark
) {
  const ws = wb.addWorksheet(sectionLabel.substring(0, 31), {
    properties: { tabColor: { argb: tabColor } },
  });

  const aggregations: { key: keyof CategoryWideBenchmark; label: string }[] = [
    { key: "median",  label: "Median" },
    { key: "average", label: "Durchschnitt" },
    { key: "min",     label: "Minimum" },
    { key: "max",     label: "Maximum" },
  ];

  let currentRow = 1;
  let resolvedColWidths: number[] = [];

  aggregations.forEach(({ key: aggKey, label: aggLabel }) => {
    if (!benchmark[aggKey]) return;

    const aggData    = benchmark[aggKey] as CategoryWideBenchmark["median"];
    const sectionData = aggData[sectionKey] as {
      labels: unknown[];
      my_data: number[];
      category_data: number[];
      q1?: number[];
      q3?: number[];
      participant_count?: number[];
      min_values?: number[];
      max_values?: number[];
      facility_values?: Record<string, number[]>;
    };

    if (!sectionData?.labels?.length) return;

    // Normalise labels → LabelEntry[]
    const labelEntries: LabelEntry[] = sectionData.labels.map(normaliseLabelEntry);

    const {
      my_data,
      category_data,
      q1,
      q3,
      participant_count,
      min_values,
      max_values,
      facility_values,
    } = sectionData;

    const hasQ1Q3           = !!(q1 && q3);
    const hasMinMax         = !!(min_values && max_values);
    const hasCount          = !!participant_count;
    const facilityKeys      = facility_values ? Object.keys(facility_values) : [];
    const hasFacilityValues = facilityKeys.length > 0;

    const headers: string[] = ["Metrik", facilityName, `Kategorie (${aggLabel})`];
    if (hasQ1Q3)           headers.push("Q1 (25%)", "Q3 (75%)");
    if (hasMinMax)         headers.push("Min", "Max");
    if (hasCount)          headers.push("Teilnehmer");
    headers.push("Abweichung", "Status");
    if (hasFacilityValues) headers.push(...facilityKeys.map((k) => `Einrichtung: ${k}`));

    resolvedColWidths = headers.map((h, i) => {
      if (i === 0) return 42; // wider to accommodate help_text
      if (h === "Abweichung" || h === "Status") return 16;
      if (h === "Teilnehmer") return 14;
      if (h.startsWith("Einrichtung:")) return 28;
      return 18;
    });

    // ── Aggregation title row ──────────────────────────────────────────────
    ws.mergeCells(currentRow, 1, currentRow, headers.length);
    const titleCell = ws.getCell(currentRow, 1);
    titleCell.value = `${aggLabel.toUpperCase()} — ${sectionLabel}`;
    titleCell.style = {
      font: { name: "Calibri", bold: true, color: { argb: C.white }, size: 11 },
      fill: { type: "pattern", pattern: "solid", fgColor: { argb: C.blue } },
      alignment: { vertical: "middle", horizontal: "left" },
    };
    ws.getRow(currentRow).height = 22;
    currentRow++;

    // ── Column header row ──────────────────────────────────────────────────
    ws.getRow(currentRow).height = 20;
    headers.forEach((h, colIdx) => {
      const cell = ws.getCell(currentRow, colIdx + 1);
      cell.value = h;
      cell.style = headerStyle(C.lightBlue, C.black);
    });
    currentRow++;

    // ── Data rows ──────────────────────────────────────────────────────────
    labelEntries.forEach((entry, i) => {
      const my       = my_data[i]       ?? 0;
      const cat      = category_data[i] ?? 0;
      const unit     = entry.unit ?? "";
      const rowFill  = i % 2 === 0 ? C.white : C.lightGrey;
      const hasHelp  = !!entry.help_text?.trim();
      const row      = ws.getRow(currentRow);

      // Taller row when there is help text, normal height otherwise
      row.height = hasHelp ? 30 : 18;

      let col = 1;

      // ── Metric cell: label + optional muted help_text second line ─────
      const metricCell = ws.getCell(currentRow, col++);
      if (hasHelp) {
        // Rich text: bold label on line 1, muted smaller help_text on line 2
        metricCell.value = {
          richText: [
            {
              text: entry.label,
              font: { name: "Calibri", bold: true, color: { argb: C.black }, size: 10 },
            },
            {
              text: `\nⓘ ${entry.help_text}`,
              font: { name: "Calibri", bold: false, italic: true, color: { argb: C.mutedGrey }, size: 8 },
            },
          ],
        };
      } else {
        metricCell.value = entry.label;
      }
      metricCell.style = {
        ...cellStyle(rowFill, C.black, true, "left"),
        alignment: { vertical: "top", horizontal: "left", wrapText: true },
      };

      // ── My Facility ───────────────────────────────────────────────────
      const myCell = ws.getCell(currentRow, col++);
      myCell.value = fmtWithUnit(my, unit);
      myCell.style = {
        ...cellStyle(rowFill, C.blue, true),
        alignment: { vertical: "top", horizontal: "right" },
        // Only apply numFmt when no unit string (raw number)
        ...(unit ? { numFmt: "@" } : {}),
      };

      // ── Category ──────────────────────────────────────────────────────
      const catCell = ws.getCell(currentRow, col++);
      catCell.value = fmtWithUnit(cat, unit);
      catCell.style = {
        ...cellStyle(rowFill, C.black),
        alignment: { vertical: "top", horizontal: "right" },
        ...(unit ? { numFmt: "@" } : {}),
      };

      if (hasQ1Q3) {
        const q1Cell = ws.getCell(currentRow, col++);
        q1Cell.value = fmtWithUnit(q1![i], unit);
        q1Cell.style = {
          ...cellStyle(rowFill, C.grey),
          alignment: { vertical: "top", horizontal: "right" },
          ...(unit ? { numFmt: "@" } : {}),
        };

        const q3Cell = ws.getCell(currentRow, col++);
        q3Cell.value = fmtWithUnit(q3![i], unit);
        q3Cell.style = {
          ...cellStyle(rowFill, C.grey),
          alignment: { vertical: "top", horizontal: "right" },
          ...(unit ? { numFmt: "@" } : {}),
        };
      }

      if (hasMinMax) {
        const minCell = ws.getCell(currentRow, col++);
        minCell.value = fmtWithUnit(min_values![i], unit);
        minCell.style = {
          ...cellStyle(rowFill, C.grey),
          alignment: { vertical: "top", horizontal: "right" },
          ...(unit ? { numFmt: "@" } : {}),
        };

        const maxCell = ws.getCell(currentRow, col++);
        maxCell.value = fmtWithUnit(max_values![i], unit);
        maxCell.style = {
          ...cellStyle(rowFill, C.grey),
          alignment: { vertical: "top", horizontal: "right" },
          ...(unit ? { numFmt: "@" } : {}),
        };
      }

      if (hasCount) {
        const countCell = ws.getCell(currentRow, col++);
        countCell.value = participant_count![i] ?? "—";
        countCell.style = {
          ...cellStyle(rowFill, C.grey, false, "center"),
          alignment: { vertical: "top", horizontal: "center" },
        };
      }

      // ── Delta ─────────────────────────────────────────────────────────
      const deltaCell = ws.getCell(currentRow, col++);
      deltaCell.value = deltaText(my, cat);
      deltaCell.style = {
        ...cellStyle(deltaFill(my, cat), deltaFontColor(my, cat), true, "center"),
        alignment: { vertical: "top", horizontal: "center" },
      };

      // ── Status ────────────────────────────────────────────────────────
      const statusCell = ws.getCell(currentRow, col++);
      if (cat !== 0) {
        const pct = ((my - cat) / cat) * 100;
        if (Math.abs(pct) < 0.5) {
          statusCell.value = "≈ Im Schnitt";
          statusCell.style = {
            ...cellStyle(rowFill, C.grey, false, "center"),
            alignment: { vertical: "top", horizontal: "center" },
          };
        } else if (pct > 0) {
          statusCell.value = "✓ Über Durchschnitt";
          statusCell.style = {
            ...cellStyle("FFD1FAE5", C.green, true, "center"),
            alignment: { vertical: "top", horizontal: "center" },
          };
        } else {
          statusCell.value = "✗ Unter Durchschnitt";
          statusCell.style = {
            ...cellStyle("FFFEE2E2", C.red, true, "center"),
            alignment: { vertical: "top", horizontal: "center" },
          };
        }
      } else {
        statusCell.value = "—";
        statusCell.style = {
          ...cellStyle(rowFill, C.grey, false, "center"),
          alignment: { vertical: "top", horizontal: "center" },
        };
      }

      if (hasFacilityValues) {
        facilityKeys.forEach((fKey) => {
          const fCell = ws.getCell(currentRow, col++);
          fCell.value = fmtWithUnit(facility_values![fKey]?.[i], unit);
          fCell.style = {
            ...cellStyle(rowFill, C.grey, false, "right"),
            alignment: { vertical: "top", horizontal: "right" },
            ...(unit ? { numFmt: "@" } : {}),
          };
        });
      }

      currentRow++;
    });

    currentRow += 2;
    ws.columns = resolvedColWidths.map((w) => ({ width: w }));
  });
}

// ─── Entry point ─────────────────────────────────────────────────────────────

export async function exportBenchmarkExcel({
  facilityName,
  categoryName,
  year,
  benchmark,
}: {
  facilityName: string;
  categoryName: string;
  year: number;
  benchmark: CategoryWideBenchmark;
}): Promise<void> {
  const wb = new ExcelJS.Workbook();
  wb.creator = "Benchmark Export";
  wb.created = new Date();
  wb.modified = new Date();
  wb.calcProperties.fullCalcOnLoad = true;

  addCoverSheet(wb, facilityName, categoryName, year);

  KPI_SECTIONS.forEach(({ key, label, tabColor }) => {
    addKpiSheet(wb, key, label, tabColor, facilityName, benchmark);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `benchmark_${facilityName.replace(/\s+/g, "_")}_${year}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}
