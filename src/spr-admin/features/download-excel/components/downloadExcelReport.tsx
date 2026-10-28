"use client";

import React, { useState } from "react";
import axios from "axios";
import {
  Download,
  FileSpreadsheet,
  ChevronDown,
  ArrowRight,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  LoaderCircle,
} from "lucide-react";
import { strToU8, zipSync } from "fflate";
import { downloadExcelService } from "@/spr-admin/features/download-excel/services/downloadExcel.service";
import { useToastStore } from "@/spr-admin/store/toast.store";

type ReportRow = Record<string, unknown>;

const reportTypes = [
  { label: "All Member", value: "AllMember" },
  { label: "Active IDs", value: "ActiveIds" },
  { label: "Wallet Report", value: "WalletReport" },
  { label: "Working Wallet", value: "WorkingWallet" },
  { label: "Deposit Wallet", value: "DepositWallet" },
  { label: "Withdrawal", value: "Withdrawal" },
  { label: "Deposit", value: "Deposit" },
  { label: "ROI Wallet", value: "ROIWallet" },
];

function isRecord(value: unknown): value is ReportRow {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function findReportRows(value: unknown, depth = 0): ReportRow[] | null {
  if (Array.isArray(value)) {
    return value.every(isRecord) ? value : null;
  }
  if (!isRecord(value) || depth > 4) return null;

  if (
    ["AuthLogin", "Name", "Mobile", "Email", "Sponsor", "RegDate", "WalletAddress", "Status"].some(
      (key) => key in value,
    )
  ) {
    return [value];
  }

  for (const key of ["data", "Data", "result", "Result", "items", "records"]) {
    if (key in value) {
      const rows = findReportRows(value[key], depth + 1);
      if (rows) return rows;
    }
  }
  return null;
}

function displayValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  return JSON.stringify(value);
}

function getErrorMessage(error: unknown): string {
  if (axios.isAxiosError<{ message?: unknown }>(error)) {
    const message = error.response?.data?.message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return error instanceof Error ? error.message : "Failed to generate report";
}

function xmlEscape(value: string): string {
  return value
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function columnName(index: number): string {
  let value = index + 1;
  let name = "";
  while (value > 0) {
    const remainder = (value - 1) % 26;
    name = String.fromCharCode(65 + remainder) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

function excelCell(value: unknown, reference: string): string {
  if (value === null || value === undefined) return `<c r="${reference}"/>`;
  if (typeof value === "number" && Number.isFinite(value)) {
    return `<c r="${reference}" t="n"><v>${value}</v></c>`;
  }
  if (typeof value === "boolean") {
    return `<c r="${reference}" t="b"><v>${value ? 1 : 0}</v></c>`;
  }

  const text =
    value instanceof Date
      ? value.toISOString()
      : typeof value === "string"
        ? value
        : (JSON.stringify(value) ?? String(value));
  return `<c r="${reference}" t="inlineStr"><is><t xml:space="preserve">${xmlEscape(text)}</t></is></c>`;
}

function downloadWorkbook(rows: ReportRow[], reportName: string) {
  const columns = Array.from(new Set(["Serial No", ...rows.flatMap((row) => Object.keys(row))]));
  const sheetRows = [
    columns,
    ...rows.map((row, rowIndex) =>
      columns.map((column) => (column === "Serial No" ? rowIndex + 1 : row[column])),
    ),
  ]
    .map(
      (row, rowIndex) =>
        `<row r="${rowIndex + 1}">${row
          .map((value, columnIndex) =>
            excelCell(value, `${columnName(columnIndex)}${rowIndex + 1}`),
          )
          .join("")}</row>`,
    )
    .join("");
  const files = {
    "[Content_Types].xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">' +
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
        '<Default Extension="xml" ContentType="application/xml"/>' +
        '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
        '<Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>' +
        "</Types>",
    ),
    "_rels/.rels": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>' +
        "</Relationships>",
    ),
    "xl/workbook.xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">' +
        '<sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets></workbook>',
    ),
    "xl/_rels/workbook.xml.rels": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">' +
        '<Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>' +
        "</Relationships>",
    ),
    "xl/worksheets/sheet1.xml": strToU8(
      '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>' +
        '<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">' +
        `<sheetData>${sheetRows}</sheetData></worksheet>`,
    ),
  };

  const filename = reportName.replace(/[^a-z0-9-_]+/gi, "-").toLowerCase();
  const content = zipSync(files);
  const blob = new Blob([content], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = `${filename}-report.xlsx`;
  anchor.click();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export default function DownloadExcelReports() {
  const [selectedReport, setSelectedReport] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [reportRows, setReportRows] = useState<ReportRow[]>([]);
  const [errorMessage, setErrorMessage] = useState("");
  const showToast = useToastStore((state) => state.showToast);
  const selectedReportLabel =
    reportTypes.find((report) => report.value === selectedReport)?.label ?? selectedReport;

  const [rowsPerPage, setRowsPerPage] = useState(500);
  const [currentPage, setCurrentPage] = useState(1);

  const totalEntries = reportRows.length;
  const totalPages = Math.ceil(totalEntries / rowsPerPage);
  const startIndex = (currentPage - 1) * rowsPerPage;
  const endIndex = startIndex + rowsPerPage;
  const currentRows = reportRows.slice(startIndex, endIndex);
  const columns = Array.from(
    new Set(["Serial No", ...reportRows.flatMap((row) => Object.keys(row))]),
  );

  const handleGenerate = async () => {
    if (!selectedReport || isLoading) return;
    setIsLoading(true);
    setIsGenerated(false);
    setErrorMessage("");
    setReportRows([]);
    setCurrentPage(1);

    try {
      const response = await downloadExcelService.generate(selectedReport);
      const rows = findReportRows(response);
      if (!rows) {
        throw new Error("The report response did not contain a list of report rows.");
      }

      setReportRows(rows);
      setIsGenerated(true);
      downloadWorkbook(rows, selectedReportLabel);
      showToast(
        rows.length > 0
          ? "Report generated and Excel file downloaded"
          : "No records found; empty Excel file downloaded",
      );
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showToast(message, "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReportChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedReport(e.target.value);
    setIsGenerated(false);
    setReportRows([]);
    setErrorMessage("");
    setCurrentPage(1);
  };

  const goToPrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const goToNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  const handleExport = () => {
    try {
      downloadWorkbook(reportRows, selectedReportLabel);
      showToast("Excel report downloaded");
    } catch (error) {
      const message = getErrorMessage(error);
      setErrorMessage(message);
      showToast(message, "error");
    }
  };

  return (
    <div className="flex w-full items-start justify-center px-4 pb-4 pt-1 font-sans text-gray-900 dark:text-gray-100">
      <div className="flex w-full flex-col gap-4">
        {/* ============ 1. Page Header ============ */}
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-sm">
            <FileSpreadsheet className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Download Excel Reports</h1>
            <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
              Generate and download various system reports
            </p>
          </div>
        </div>

        {/* ============ 2. Report Generator Card ============ */}
        <div className="w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm dark:border-gray-700 dark:bg-[#111318]">
          <div className="bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
            <h2 className="flex items-center gap-2 text-lg font-bold text-white">
              <Download className="h-5 w-5" />
              Report Generator
            </h2>
            <p className="mt-1 text-xs text-white/90">Select a report type to download data</p>
          </div>

          <div className="p-6">
            {/* Select Report Type */}
            <div className="mb-5 max-w-md">
              <label className="mb-1.5 flex items-center gap-1.5 text-xs font-bold uppercase text-gray-500 dark:text-gray-400">
                <FileSpreadsheet className="h-3.5 w-3.5 text-blue-600" /> Select Report Type *
              </label>
              <div className="relative">
                <select
                  value={selectedReport}
                  onChange={handleReportChange}
                  className="w-full appearance-none rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                >
                  <option value="">Select a Report Type</option>
                  {reportTypes.map((report) => (
                    <option key={report.value} value={report.value}>
                      {report.label}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3">
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                </div>
              </div>
            </div>

            {/* Download Button */}
            <div className="max-w-md">
              <button
                onClick={handleGenerate}
                disabled={!selectedReport || isLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-[#1680ff] to-[#25c6e8] py-3 text-sm font-bold text-white transition hover:brightness-105 disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500"
              >
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Download className="h-4 w-4" />
                )}
                {isLoading ? "Generating Report..." : "Generate & Download Report"}
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {errorMessage && (
              <p className="mt-3 text-sm text-red-700 dark:text-red-300" role="alert">
                {errorMessage}
              </p>
            )}
          </div>
        </div>

        {/* ============ 3. Report Table  ============ */}
        {isGenerated && selectedReport && (
          <div className="animate-in fade-in slide-in-from-top-3 w-full overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm duration-300 dark:border-gray-700 dark:bg-[#111318]">
            {/* Table Header */}
            <div className="flex items-center justify-between bg-gradient-to-r from-[#1680ff] to-[#25c6e8] px-6 py-4">
              <h2 className="flex items-center gap-2 text-lg font-bold text-white">
                <RotateCw className="h-5 w-5" />
                {selectedReportLabel} Report
              </h2>
              <div className="flex items-center gap-3">
                <span className="text-xs font-bold text-white/90">
                  Total Records: {totalEntries}
                </span>
                {isGenerated && (
                  <button
                    type="button"
                    onClick={handleExport}
                    className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-xs font-bold text-blue-700 transition hover:bg-blue-50"
                  >
                    <Download className="h-4 w-4" />
                    Download Excel
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full min-w-[900px] border-collapse text-left">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50 text-[10px] font-bold uppercase tracking-wider text-gray-600 dark:border-gray-700 dark:bg-[#191c23] dark:text-gray-300">
                    {columns.map((column) => (
                      <th
                        key={column}
                        className="whitespace-nowrap border-r border-gray-200 px-3 py-3 last:border-r-0 dark:border-gray-700"
                      >
                        {column}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="text-xs text-gray-700 dark:text-gray-300">
                  {currentRows.length === 0 ? (
                    <tr>
                      <td
                        colSpan={Math.max(columns.length, 1)}
                        className="px-3 py-8 text-center text-gray-500 dark:text-gray-400"
                      >
                        No data available for this report.
                      </td>
                    </tr>
                  ) : (
                    currentRows.map((row, rowIndex) => (
                      <tr
                        key={`${startIndex + rowIndex}`}
                        className="border-b border-gray-100 transition-colors hover:bg-blue-50/70 dark:border-gray-700 dark:hover:bg-blue-500/5"
                      >
                        {columns.map((column) => (
                          <td
                            key={column}
                            className="whitespace-nowrap border-r border-gray-100 px-3 py-4 last:border-r-0 dark:border-gray-700"
                          >
                            {column === "Serial No"
                              ? startIndex + rowIndex + 1
                              : displayValue(row[column])}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col items-center justify-between gap-3 border-t border-gray-100 bg-white px-6 py-3 dark:border-gray-700 dark:bg-[#111318] md:flex-row">
              <div className="flex items-center gap-2 text-xs text-gray-600 dark:text-gray-300">
                <span>Rows per page:</span>
                <select
                  value={rowsPerPage}
                  onChange={(e) => {
                    setRowsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className="rounded border border-gray-300 bg-white px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-[#0b0d12] dark:text-gray-200"
                >
                  <option value={10}>10</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                  <option value={500}>500</option>
                </select>
              </div>

              <div className="text-xs text-gray-600 dark:text-gray-300">
                Showing {totalEntries === 0 ? 0 : startIndex + 1} to{" "}
                {Math.min(endIndex, totalEntries)} of {totalEntries} entries
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={goToPrev}
                  disabled={currentPage === 1}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-r from-[#1680ff] to-[#25c6e8] text-xs font-bold text-white">
                  {currentPage}
                </button>
                <button
                  onClick={goToNext}
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
