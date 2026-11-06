import { useMemo, useState } from "react";
import { isMissingCell } from "@/lib/missing";

const PAGE_SIZE_OPTIONS = [25, 50, 100, 500] as const;
const DEFAULT_PAGE_SIZE = 50;

interface DataPreviewModalProps {
  title: string;
  headers: string[];
  rows: string[][];
  /** column to highlight and (optionally) filter on; null previews the whole file */
  highlightColIndex?: number | null;
  onClose: () => void;
}

export function DataPreviewModal({
  title,
  headers,
  rows,
  highlightColIndex = null,
  onClose,
}: DataPreviewModalProps) {
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState<number>(DEFAULT_PAGE_SIZE);
  const [missingOnly, setMissingOnly] = useState(highlightColIndex != null);

  const filteredRows = useMemo(() => {
    if (!missingOnly || highlightColIndex == null) {
      return rows.map((row, i) => ({ row, csvRow: i + 2 }));
    }
    return rows
      .map((row, i) => ({ row, csvRow: i + 2 }))
      .filter(({ row }) => isMissingCell(row[highlightColIndex]));
  }, [rows, missingOnly, highlightColIndex]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));
  const safePage = Math.min(page, totalPages - 1);
  const pageRows = filteredRows.slice(
    safePage * pageSize,
    (safePage + 1) * pageSize
  );

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="flex max-h-[90vh] w-fit max-w-[95vw] flex-col overflow-hidden rounded-lg bg-surface shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">{title}</h2>
          <button
            onClick={onClose}
            className="rounded px-2 py-1 text-sm text-gray-500 hover:bg-gray-100"
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-gray-200 px-4 py-2 text-xs text-gray-600">
          {highlightColIndex != null && (
            <label className="flex items-center gap-1.5">
              <input
                type="checkbox"
                checked={missingOnly}
                onChange={(e) => {
                  setMissingOnly(e.target.checked);
                  setPage(0);
                }}
              />
              Only rows missing &ldquo;{headers[highlightColIndex]}&rdquo;
            </label>
          )}
          <span>
            {filteredRows.length === 0
              ? "0 rows"
              : `Rows ${safePage * pageSize + 1}–${Math.min(
                  (safePage + 1) * pageSize,
                  filteredRows.length
                )} of ${filteredRows.length}`}
          </span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="rounded border border-gray-300 px-1.5 py-0.5"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} / page
              </option>
            ))}
          </select>
          <div className="flex gap-1">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={safePage === 0}
              className="rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40"
            >
              ← Prev
            </button>
            <button
              onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
              disabled={safePage >= totalPages - 1}
              className="rounded border border-gray-300 px-2 py-0.5 disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </div>

        <div className="overflow-auto">
          <table className="border-collapse text-xs">
            <thead>
              <tr className="sticky top-0 z-10 bg-gray-50">
                <th className="border-b border-r border-gray-200 px-2 py-1.5 text-left font-medium text-gray-400">
                  Row
                </th>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className={`whitespace-nowrap border-b border-r border-gray-200 px-2 py-1.5 text-left font-medium ${
                      i === highlightColIndex
                        ? "bg-blue-100 text-blue-800"
                        : "text-gray-600"
                    }`}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pageRows.map(({ row, csvRow }) => (
                <tr key={csvRow} className="odd:bg-white even:bg-gray-50/60">
                  <td className="border-r border-gray-100 px-2 py-1 text-gray-400">
                    {csvRow}
                  </td>
                  {headers.map((_, i) => {
                    const cell = row[i];
                    const missing = isMissingCell(cell);
                    const cls =
                      i === highlightColIndex
                        ? missing
                          ? "bg-red-100 text-red-700 font-medium"
                          : "bg-blue-50/60"
                        : missing
                          ? "text-gray-400 italic"
                          : "text-gray-800";
                    return (
                      <td
                        key={i}
                        className={`whitespace-nowrap border-r border-gray-100 px-2 py-1 ${cls}`}
                      >
                        {missing ? "—" : cell}
                      </td>
                    );
                  })}
                </tr>
              ))}
              {pageRows.length === 0 && (
                <tr>
                  <td
                    colSpan={headers.length + 1}
                    className="px-2 py-6 text-center text-gray-400"
                  >
                    No rows to show.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
