"use client";

import { useState } from "react";
import { InternalBenchmark } from "@/lib/types/benchmark";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFilePdf, faFileExcel, faSpinner } from "@fortawesome/free-solid-svg-icons";

const BRAND = {
  blue: "#004f9e",
  lightBlue: "#f0f3f6",
  black: "#000000",
  white: "#ffffff",
  blueRgb: [0, 79, 158] as [number, number, number],
  lightBlueRgb: [240, 243, 246] as [number, number, number],
  grayRgb: [100, 116, 139] as [number, number, number],
  mutedRgb: [148, 163, 184] as [number, number, number], // slate-400 — for help_text
  rowAltRgb: [248, 250, 252] as [number, number, number],
};

type SectionKey = keyof InternalBenchmark;

const SECTION_KEYS: SectionKey[] = [
  "occupancy_utilization",
  "revenue_kpis",
  "cost_efficiency_kpis",
  "category_specific_kpis",
];

const SECTION_LABELS: Record<SectionKey, string> = {
  occupancy_utilization: "Belegung & Nutzung",
  revenue_kpis: "Erlöskennzahlen",
  cost_efficiency_kpis: "Kosten & Effizienzkennzahlen",
  category_specific_kpis: "Kategorie-spezifische Kennzahlen",
};

function fmt(n: number) {
  return n.toLocaleString("de-DE", { maximumFractionDigits: 2 });
}

function fmtWithUnit(n: number, unit?: string): string {
  return unit ? `${fmt(n)} ${unit}` : fmt(n);
}

function average(values: number[]) {
  if (!values.length) return 0;
  return values.reduce((s, v) => s + v, 0) / values.length;
}

function median(values: number[]) {
  if (!values.length) return 0;
  const s = [...values].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 !== 0 ? s[m] : (s[m - 1] + s[m]) / 2;
}

// ─── PDF export ───────────────────────────────────────────────────────────────

async function exportPdf(
  benchmark: InternalBenchmark,
  year: number,
  federationName: string,
) {
  const { default: jsPDF } = await import("jspdf");
  const autoTable = (await import("jspdf-autotable")).default;

  const doc = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const W = doc.internal.pageSize.getWidth();   // 297
  const H = doc.internal.pageSize.getHeight();  // 210
  const margin = 14;

  const TOTAL_PAGES_TOKEN = "{TOTAL_PAGES}";

  function headerBand(title: string, subtitle?: string) {
    doc.setFillColor(...BRAND.blueRgb);
    doc.rect(0, 0, W, 22, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(title, margin, 14);
    if (subtitle) {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9);
      doc.text(subtitle, margin, 19);
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.text(`${year}`, W - margin, 14, { align: "right" });
  }

  function footer() {
    const pageNum = (doc.internal as any).getCurrentPageInfo().pageNumber;
    doc.setFillColor(...BRAND.lightBlueRgb);
    doc.rect(0, H - 10, W, 10, "F");
    doc.setTextColor(...BRAND.grayRgb);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.text("Himmlische Herbergen · Interner Benchmark", margin, H - 3.5);
    doc.text(`Seite ${pageNum} / ${TOTAL_PAGES_TOKEN}`, W - margin, H - 3.5, { align: "right" });
    doc.text(
      `Erstellt am ${new Date().toLocaleDateString("de-DE")}`,
      W / 2,
      H - 3.5,
      { align: "center" },
    );
  }

  // ── Cover page ──────────────────────────────────────────────────────────────
  doc.setFillColor(...BRAND.blueRgb);
  doc.rect(0, 0, W, H, "F");
  doc.setFillColor(255, 255, 255);
  doc.roundedRect(margin * 2, H * 0.22, W - margin * 4, H * 0.55, 5, 5, "F");
  doc.setTextColor(...BRAND.blueRgb);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text("Interner Benchmark", W / 2, H * 0.40, { align: "center" });
  doc.setFontSize(16);
  doc.setFont("helvetica", "normal");
  doc.text(federationName, W / 2, H * 0.50, { align: "center" });
  doc.setFontSize(13);
  doc.setTextColor(...BRAND.grayRgb);
  doc.text(`Berichtsjahr ${year}`, W / 2, H * 0.59, { align: "center" });
  doc.setDrawColor(...BRAND.blueRgb);
  doc.setLineWidth(0.5);
  doc.line(W / 2 - 30, H * 0.54, W / 2 + 30, H * 0.54);
  doc.setFontSize(8);
  doc.text(`Erstellt am ${new Date().toLocaleDateString("de-DE")}`, W / 2, H * 0.82, { align: "center" });
  doc.setFillColor(...BRAND.lightBlueRgb);
  doc.rect(0, H - 18, W, 18, "F");
  doc.setTextColor(...BRAND.grayRgb);
  doc.setFontSize(8);
  doc.text("Himmlische Herbergen · Vertraulich", W / 2, H - 6, { align: "center" });

  const facilities = benchmark.occupancy_utilization.data.map((f) => f.name);

  // ── KPI comparison pages ────────────────────────────────────────────────────
  for (const key of SECTION_KEYS) {
    doc.addPage();
    const section = benchmark[key];
    const label = SECTION_LABELS[key];

    headerBand(
      `Vergleich: ${label}`,
      `${facilities.length} Einrichtungen · ${section.labels.length} KPIs`,
    );

    const head = [["KPI", ...facilities]];

    // Body: label in col 0 (help_text painted via didDrawCell), values with unit
    const body = section.labels.map((item, li) => [
      item.label,
      ...section.data.map((f) => fmtWithUnit(f.data[li], item.unit)),
    ]);

    const avgRow = [
      "⌀ Durchschnitt",
      ...section.data.map((f) => fmt(average(f.data))),
    ];

    autoTable(doc, {
      startY: 26,
      head,
      body: [...body, avgRow],
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
        textColor: [30, 41, 59],
        lineColor: [226, 232, 240],
        lineWidth: 0.2,
        overflow: "linebreak",
        minCellHeight: 13,
      },
      headStyles: {
        fillColor: BRAND.blueRgb,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8.5,
        halign: "center",
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
          halign: "left",
          cellWidth: 55,
          cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
        },
      },
      alternateRowStyles: { fillColor: BRAND.lightBlueRgb },
      didParseCell(data) {
        if (data.row.index === body.length) {
          data.cell.styles.fillColor = [224, 231, 255];
          data.cell.styles.fontStyle = "bold";
          data.cell.styles.textColor = BRAND.blueRgb;
        }
      },
      didDrawCell(data) {
        if (data.section === "body" && data.column.index === 0) {
          const rowIdx = data.row.index;
          if (rowIdx >= section.labels.length) return;
          const helpText = section.labels[rowIdx]?.help_text?.trim();
          if (!helpText) return;

          const maxWidth = data.cell.width - 4;
          const wrapped = doc.splitTextToSize(`ⓘ  ${helpText}`, maxWidth) as string[];

          doc.setFont("helvetica", "italic");
          doc.setFontSize(6.5);
          doc.setTextColor(...BRAND.mutedRgb);

          const textY = data.cell.y + data.cell.padding("top") + 4.5 + 1.2;
          wrapped.slice(0, 2).forEach((line, li) => {
            doc.text(line, data.cell.x + data.cell.padding("left"), textY + li * 3);
          });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
        }
      },
      margin: { left: margin, right: margin },
    });

    footer();
  }

  // ── Stats page ──────────────────────────────────────────────────────────────
  doc.addPage();
  headerBand("Statistische Kennzahlen", "Mittelwert · Median · Min · Max je KPI");

  let statsY = 26;

  for (const key of SECTION_KEYS) {
    if (statsY > H - 50) {
      doc.addPage();
      headerBand("Statistische Kennzahlen (Fortsetzung)");
      statsY = 26;
    }

    const section = benchmark[key];
    const label = SECTION_LABELS[key];

    doc.setFillColor(...BRAND.lightBlueRgb);
    doc.rect(margin, statsY, W - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.blueRgb);
    doc.text(label, margin + 2, statsY + 4);
    statsY += 7;

    const statBody = section.labels.map((item, li) => {
      const vals = section.data.map((f) => f.data[li]);
      const unit = item.unit ?? "";
      return [
        item.label,
        fmtWithUnit(average(vals), unit),
        fmtWithUnit(median(vals), unit),
        fmtWithUnit(Math.min(...vals), unit),
        fmtWithUnit(Math.max(...vals), unit),
        fmtWithUnit(Math.max(...vals) - Math.min(...vals), unit),
      ];
    });

    autoTable(doc, {
      startY: statsY,
      head: [["KPI", "Ø Mittel", "Median", "Min", "Max", "Spanne"]],
      body: statBody,
      theme: "grid",
      styles: {
        font: "helvetica",
        fontSize: 8,
        cellPadding: { top: 2.5, bottom: 2.5, left: 2, right: 2 },
        overflow: "linebreak",
        minCellHeight: 13,
      },
      headStyles: {
        fillColor: BRAND.blueRgb,
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 8,
      },
      columnStyles: {
        0: {
          fontStyle: "bold",
          cellWidth: 60,
          cellPadding: { top: 3, bottom: 3, left: 2, right: 2 },
        },
        1: { halign: "right" },
        2: { halign: "right" },
        3: { halign: "right", textColor: [5, 150, 105] },
        4: { halign: "right", textColor: [220, 38, 38] },
        5: { halign: "right" },
      },
      alternateRowStyles: { fillColor: BRAND.lightBlueRgb },
      didDrawCell(data) {
        if (data.section === "body" && data.column.index === 0) {
          const helpText = section.labels[data.row.index]?.help_text?.trim();
          if (!helpText) return;

          const maxWidth = data.cell.width - 4;
          const wrapped = doc.splitTextToSize(`ⓘ  ${helpText}`, maxWidth) as string[];

          doc.setFont("helvetica", "italic");
          doc.setFontSize(6.5);
          doc.setTextColor(...BRAND.mutedRgb);

          const textY = data.cell.y + data.cell.padding("top") + 4.5 + 1.2;
          wrapped.slice(0, 2).forEach((line, li) => {
            doc.text(line, data.cell.x + data.cell.padding("left"), textY + li * 3);
          });

          doc.setFont("helvetica", "normal");
          doc.setFontSize(8);
          doc.setTextColor(30, 41, 59);
        }
      },
      margin: { left: margin, right: margin },
    });

    statsY = (doc as any).lastAutoTable.finalY + 6;
  }

  footer();

  // ── Ranking page ────────────────────────────────────────────────────────────
  doc.addPage();
  headerBand("Ranking", "Einrichtungen nach Durchschnitt aller KPIs pro Kategorie");

  let rankY = 26;

  for (const key of SECTION_KEYS) {
    if (rankY > H - 50) break;

    const section = benchmark[key];
    const ranked = [...section.data]
      .map((f) => ({ name: f.name, avg: average(f.data) }))
      .sort((a, b) => b.avg - a.avg);

    const medals: Record<number, string> = { 0: "🥇", 1: "🥈", 2: "🥉" };

    doc.setFillColor(...BRAND.lightBlueRgb);
    doc.rect(margin, rankY, W - margin * 2, 6, "F");
    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(...BRAND.blueRgb);
    doc.text(SECTION_LABELS[key], margin + 2, rankY + 4);
    rankY += 7;

    autoTable(doc, {
      startY: rankY,
      head: [["Rang", "Einrichtung", "Ø KPI-Wert"]],
      body: ranked.map((f, i) => [`${medals[i] ?? `${i + 1}.`}`, f.name, fmt(f.avg)]),
      theme: "grid",
      styles: { font: "helvetica", fontSize: 8.5, cellPadding: 2.5 },
      headStyles: {
        fillColor: BRAND.blueRgb,
        textColor: [255, 255, 255],
        fontStyle: "bold",
      },
      columnStyles: {
        0: { halign: "center", cellWidth: 18 },
        1: { fontStyle: "bold" },
        2: { halign: "right" },
      },
      alternateRowStyles: { fillColor: BRAND.lightBlueRgb },
      margin: { left: margin, right: margin },
    });

    rankY = (doc as any).lastAutoTable.finalY + 8;
  }

  footer();

  doc.putTotalPages(TOTAL_PAGES_TOKEN);
  doc.save(`Verbund_Vergleich_${year}.pdf`);
}

// ─── Excel styles ─────────────────────────────────────────────────────────────

const XL = {
  headerFill: {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FF004F9E" },
  },
  lightBlueFill: {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FFF0F3F6" },
  },
  accentFill: {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FFE0E7FF" },
  },
  whiteFill: {
    type: "pattern" as const,
    pattern: "solid" as const,
    fgColor: { argb: "FFFFFFFF" },
  },
  headerFont: { name: "Source Sans Pro", bold: true, color: { argb: "FFFFFFFF" }, size: 10 },
  boldBlueFont: { name: "Source Sans Pro", bold: true, color: { argb: "FF004F9E" }, size: 10 },
  boldFont: { name: "Source Sans Pro", bold: true, size: 10 },
  normalFont: { name: "Source Sans Pro", size: 10 },
  smallGrayFont: { name: "Source Sans Pro", size: 9, color: { argb: "FF64748B" } },
  thinBorder: {
    top:    { style: "thin" as const, color: { argb: "FFE2E8F0" } },
    left:   { style: "thin" as const, color: { argb: "FFE2E8F0" } },
    bottom: { style: "thin" as const, color: { argb: "FFE2E8F0" } },
    right:  { style: "thin" as const, color: { argb: "FFE2E8F0" } },
  },
  numFmt: "#,##0.00",
};

function applyHeaderRow(row: import("exceljs").Row) {
  row.height = 22;
  row.eachCell((cell) => {
    cell.fill = XL.headerFill;
    cell.font = XL.headerFont;
    cell.alignment = { vertical: "middle", horizontal: "center", wrapText: false };
    cell.border = XL.thinBorder;
  });
}

function applyDataRow(row: import("exceljs").Row, isAlt: boolean, isNumericFrom = 1) {
  row.height = 18;
  row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
    cell.fill = isAlt ? XL.lightBlueFill : XL.whiteFill;
    cell.font = colIdx === 1 ? { ...XL.boldFont } : XL.normalFont;
    cell.alignment = {
      vertical: "middle",
      horizontal: colIdx > isNumericFrom ? "right" : "left",
    };
    cell.border = XL.thinBorder;
    // Only apply numFmt for pure numeric values — string values (with unit) use "@"
    if (colIdx > isNumericFrom && typeof cell.value === "number") {
      cell.numFmt = XL.numFmt;
    }
  });
}

function applyAvgRow(row: import("exceljs").Row, numericFrom = 1) {
  row.height = 20;
  row.eachCell({ includeEmpty: true }, (cell, colIdx) => {
    cell.fill = XL.accentFill;
    cell.font = { ...XL.boldBlueFont };
    cell.alignment = {
      vertical: "middle",
      horizontal: colIdx > numericFrom ? "right" : "left",
    };
    cell.border = {
      ...XL.thinBorder,
      top: { style: "medium" as const, color: { argb: "FF004F9E" } },
    };
    if (colIdx > numericFrom && typeof cell.value === "number") {
      cell.numFmt = XL.numFmt;
    }
  });
}

function addSectionHeader(
  ws: import("exceljs").Worksheet,
  title: string,
  colSpan: number,
) {
  const row = ws.addRow([title]);
  ws.mergeCells(row.number, 1, row.number, colSpan);
  row.height = 26;
  const cell = row.getCell(1);
  cell.fill = XL.headerFill;
  cell.font = { ...XL.headerFont, size: 11 };
  cell.alignment = { vertical: "middle", horizontal: "left" };
  cell.border = XL.thinBorder;
}

/** Resolve cell value + numFmt for a KPI value that may have a unit. */
function kpiCellValue(n: number, unit?: string): { value: string | number; numFmt?: string } {
  if (unit) return { value: fmtWithUnit(n, unit), numFmt: "@" };
  return { value: n, numFmt: XL.numFmt };
}

// ─── Excel export ─────────────────────────────────────────────────────────────

async function exportExcel(
  benchmark: InternalBenchmark,
  year: number,
  federationName: string,
) {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  wb.creator = "Himmlische Herbergen";
  wb.created = new Date();

  const facilities = benchmark.occupancy_utilization.data.map((f) => f.name);

  // ── Cover sheet ──────────────────────────────────────────────────────────────
  const wsOver = wb.addWorksheet("Übersicht");
  wsOver.columns = [{ width: 32 }, { width: 44 }];

  wsOver.addRow(["Interner Benchmark – Übersicht"]);
  wsOver.mergeCells("A1:B1");
  const titleCell = wsOver.getCell("A1");
  titleCell.fill = XL.headerFill;
  titleCell.font = { name: "Source Sans Pro", bold: true, color: { argb: "FFFFFFFF" }, size: 14 };
  titleCell.alignment = { vertical: "middle", horizontal: "left" };
  wsOver.getRow(1).height = 32;
  wsOver.addRow([]);

  const metaRows: [string, string | number][] = [
    ["Verband", federationName],
    ["Berichtsjahr", year],
    ["Erstellt am", new Date().toLocaleDateString("de-DE")],
    ["Anzahl Einrichtungen", facilities.length],
  ];
  metaRows.forEach(([label, value]) => {
    const r = wsOver.addRow([label, value]);
    r.height = 18;
    r.getCell(1).font = { ...XL.boldFont };
    r.getCell(1).fill = XL.lightBlueFill;
    r.getCell(2).font = XL.normalFont;
    r.getCell(2).fill = XL.whiteFill;
    r.eachCell((c) => { c.border = XL.thinBorder; c.alignment = { vertical: "middle" }; });
  });
  wsOver.addRow([]);

  const facHeader = wsOver.addRow(["#", "Einrichtung"]);
  applyHeaderRow(facHeader);
  facilities.forEach((name, i) => {
    const r = wsOver.addRow([i + 1, name]);
    applyDataRow(r, i % 2 === 1, 0);
  });

  // ── KPI section sheets ──────────────────────────────────────────────────────
  for (const key of SECTION_KEYS) {
    const section = benchmark[key];
    const label = SECTION_LABELS[key];
    const totalCols = 1 + section.data.length + 4;

    const ws = wb.addWorksheet(label.substring(0, 31));
    ws.columns = [
      { width: 44 }, // wider for help_text
      ...section.data.map(() => ({ width: 20 })),
      { width: 18 }, // Ø Durchschnitt
      { width: 14 }, // Median
      { width: 14 }, // Min
      { width: 14 }, // Max
    ];

    addSectionHeader(ws, `${label} · ${year}`, totalCols);

    const headerRow = ws.addRow([
      "KPI",
      ...section.data.map((f) => f.name),
      "Ø Durchschnitt",
      "Median",
      "Min",
      "Max",
    ]);
    applyHeaderRow(headerRow);
    headerRow.getCell(1).alignment = { vertical: "middle", horizontal: "left" };

    section.labels.forEach((item, li) => {
      const vals = section.data.map((f) => f.data[li]);
      const unit = item.unit ?? "";
      const hasHelp = !!item.help_text?.trim();

      // Facility values with unit
      const facilityVals = vals.map((v) => kpiCellValue(v, unit));
      // Stat values with unit
      const avgVal  = kpiCellValue(average(vals), unit);
      const medVal  = kpiCellValue(median(vals), unit);
      const minVal  = kpiCellValue(Math.min(...vals), unit);
      const maxVal  = kpiCellValue(Math.max(...vals), unit);

      const r = ws.addRow([
        item.label,
        ...facilityVals.map((v) => v.value),
        avgVal.value,
        medVal.value,
        minVal.value,
        maxVal.value,
      ]);

      applyDataRow(r, li % 2 === 1);

      // ── KPI label cell: richText with muted help_text sub-line ──────────
      const kpiCell = r.getCell(1);
      if (hasHelp) {
        kpiCell.value = {
          richText: [
            {
              text: item.label,
              font: { name: "Source Sans Pro", bold: true, color: { argb: "FF000000" }, size: 10 },
            },
            {
              text: `\nⓘ ${item.help_text}`,
              font: { name: "Source Sans Pro", bold: false, italic: true, color: { argb: "FF94A3B8" }, size: 8 },
            },
          ],
        };
        r.height = 30;
      }
      kpiCell.alignment = { vertical: "top", horizontal: "left", wrapText: true };

      // Apply numFmt and alignment to value columns
      const valueColOffset = 2; // col 1 = KPI label, value cols start at 2
      [...facilityVals, avgVal, medVal, minVal, maxVal].forEach((v, vi) => {
        const cell = r.getCell(valueColOffset + vi);
        cell.numFmt = v.numFmt ?? XL.numFmt;
        cell.alignment = { vertical: hasHelp ? "top" : "middle", horizontal: "right" };
      });

      // Colour min/max columns
      const minColIdx = 1 + section.data.length + 3;
      const maxColIdx = 1 + section.data.length + 4;
      r.getCell(minColIdx).font = { ...XL.normalFont, color: { argb: "FF059669" } };
      r.getCell(maxColIdx).font = { ...XL.normalFont, color: { argb: "FFDC2626" } };
    });

    const avgRow = ws.addRow([
      "Ø Verbundsdurchschnitt",
      ...section.data.map((f) => average(f.data)),
      average(section.data.map((f) => average(f.data))),
      "", "", "",
    ]);
    applyAvgRow(avgRow);

    ws.views = [{ state: "frozen", xSplit: 1, ySplit: 2 }];
  }

  // ── Statistics sheet ─────────────────────────────────────────────────────────
  const wsStat = wb.addWorksheet("Statistiken");
  wsStat.columns = [
    { width: 38 }, { width: 46 },
    { width: 16 }, { width: 14 }, { width: 14 }, { width: 14 }, { width: 14 },
  ];

  const statHeader = wsStat.addRow(["Abschnitt", "KPI", "Ø Mittelwert", "Median", "Min", "Max", "Spanne"]);
  applyHeaderRow(statHeader);
  statHeader.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  statHeader.getCell(2).alignment = { vertical: "middle", horizontal: "left" };

  let statRowIdx = 0;
  for (const key of SECTION_KEYS) {
    const section = benchmark[key];
    section.labels.forEach((item, li) => {
      const vals = section.data.map((f) => f.data[li]);
      const unit = item.unit ?? "";
      const minVal   = Math.min(...vals);
      const maxVal   = Math.max(...vals);
      const hasHelp  = !!item.help_text?.trim();

      const avgKpi   = kpiCellValue(average(vals), unit);
      const medKpi   = kpiCellValue(median(vals), unit);
      const minKpi   = kpiCellValue(minVal, unit);
      const maxKpi   = kpiCellValue(maxVal, unit);
      const spanKpi  = kpiCellValue(maxVal - minVal, unit);

      const r = wsStat.addRow([
        SECTION_LABELS[key],
        item.label,
        avgKpi.value,
        medKpi.value,
        minKpi.value,
        maxKpi.value,
        spanKpi.value,
      ]);
      applyDataRow(r, statRowIdx % 2 === 1);
      r.getCell(1).font = { ...XL.smallGrayFont };

      // Apply numFmt to stat value columns (3–7)
      [avgKpi, medKpi, minKpi, maxKpi, spanKpi].forEach((v, vi) => {
        const cell = r.getCell(3 + vi);
        cell.numFmt = v.numFmt ?? XL.numFmt;
        cell.alignment = { vertical: hasHelp ? "top" : "middle", horizontal: "right" };
      });

      // ── KPI label cell: richText with muted help_text sub-line ──────────
      const kpiCell = r.getCell(2);
      if (hasHelp) {
        kpiCell.value = {
          richText: [
            {
              text: item.label,
              font: { name: "Source Sans Pro", bold: true, color: { argb: "FF000000" }, size: 10 },
            },
            {
              text: `\nⓘ ${item.help_text}`,
              font: { name: "Source Sans Pro", bold: false, italic: true, color: { argb: "FF94A3B8" }, size: 8 },
            },
          ],
        };
        r.height = 30;
        r.eachCell({ includeEmpty: true }, (cell, colIdx) => {
          if (colIdx !== 2) cell.alignment = { vertical: "top", horizontal: colIdx > 2 ? "right" : "left" };
        });
      }
      kpiCell.font = { ...XL.boldFont };
      kpiCell.alignment = { vertical: "top", horizontal: "left", wrapText: true };

      r.getCell(5).font = { ...XL.normalFont, color: { argb: "FF059669" } };
      r.getCell(6).font = { ...XL.normalFont, color: { argb: "FFDC2626" } };
      statRowIdx++;
    });
  }

  wsStat.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  // ── Ranking sheet ────────────────────────────────────────────────────────────
  const wsRank = wb.addWorksheet("Ranking");
  wsRank.columns = [
    { width: 38 }, { width: 8 }, { width: 40 }, { width: 18 },
  ];

  const rankHeader = wsRank.addRow(["Abschnitt", "Rang", "Einrichtung", "Ø KPI-Wert"]);
  applyHeaderRow(rankHeader);
  rankHeader.getCell(1).alignment = { vertical: "middle", horizontal: "left" };
  rankHeader.getCell(3).alignment = { vertical: "middle", horizontal: "left" };

  let rankRowIdx = 0;
  for (const key of SECTION_KEYS) {
    const section = benchmark[key];
    const ranked = [...section.data]
      .map((f) => ({ name: f.name, avg: average(f.data) }))
      .sort((a, b) => b.avg - a.avg);

    ranked.forEach((f, i) => {
      const r = wsRank.addRow([SECTION_LABELS[key], i + 1, f.name, f.avg]);
      applyDataRow(r, rankRowIdx % 2 === 1, 1);
      r.getCell(1).font = { ...XL.smallGrayFont };
      r.getCell(2).alignment = { vertical: "middle", horizontal: "center" };
      r.getCell(2).font =
        i === 0 ? { ...XL.boldFont, color: { argb: "FFD97706" } }
        : i === 1 ? { ...XL.boldFont, color: { argb: "FF64748B" } }
        : i === 2 ? { ...XL.boldFont, color: { argb: "FFB45309" } }
        : XL.normalFont;
      r.getCell(4).numFmt = XL.numFmt;
      rankRowIdx++;
    });
  }

  wsStat.views = [{ state: "frozen", xSplit: 0, ySplit: 1 }];

  const buffer = await wb.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Verbund_Vergleich_${year}.xlsx`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface ExportBenchmarkProps {
  benchmark: InternalBenchmark;
  year: number;
  federationName: string;
}

export default function ExportBenchmark({
  benchmark,
  year,
  federationName,
}: ExportBenchmarkProps) {
  const [pdfLoading, setPdfLoading] = useState(false);
  const [xlsxLoading, setXlsxLoading] = useState(false);

  async function handlePdf() {
    setPdfLoading(true);
    try {
      await exportPdf(benchmark, year, federationName);
    } finally {
      setPdfLoading(false);
    }
  }

  async function handleExcel() {
    setXlsxLoading(true);
    try {
      await exportExcel(benchmark, year, federationName);
    } finally {
      setXlsxLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handlePdf}
        disabled={pdfLoading}
        title={`PDF herunterladen: Verbund_Vergleich_${year}.pdf`}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
          bg-white border border-red-200 text-red-700 hover:bg-red-50 hover:border-red-300
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {pdfLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FontAwesomeIcon icon={faFilePdf} className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{pdfLoading ? "Generiere…" : "PDF"}</span>
      </button>

      <button
        onClick={handleExcel}
        disabled={xlsxLoading}
        title={`Excel herunterladen: Verbund_Vergleich_${year}.xlsx`}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all cursor-pointer
          bg-white border border-green-200 text-green-700 hover:bg-green-50 hover:border-green-300
          disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {xlsxLoading ? (
          <FontAwesomeIcon icon={faSpinner} className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <FontAwesomeIcon icon={faFileExcel} className="w-3.5 h-3.5" />
        )}
        <span className="hidden sm:inline">{xlsxLoading ? "Generiere…" : "Excel"}</span>
      </button>
    </div>
  );
}
