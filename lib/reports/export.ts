export type Column<T> = { header: string; value: (row: T) => string | number | null };

function cell(v: string | number | null): string {
  if (v === null || v === undefined) return "";
  const s = typeof v === "number" ? String(v).replace(".", ",") : v; // decimal con coma (Excel en espanol)
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

/**
 * Descarga un CSV que Excel abre directo: separador ";" y BOM UTF-8
 * para que los acentos se vean bien.
 */
export function downloadCsv<T>(filename: string, columns: Column<T>[], rows: T[]) {
  const lines = [
    columns.map((c) => cell(c.header)).join(";"),
    ...rows.map((r) => columns.map((c) => cell(c.value(r))).join(";")),
  ];
  const blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
