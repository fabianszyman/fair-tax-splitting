import { useMemo, useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { estSplitting, formatEuro } from "@/lib/tax/tax2025";

export function SplittingTable({ zve }: { zve?: number }) {
  const [selectedZve, setSelectedZve] = useState<number | null>(null);

  const rows = useMemo(() => {
    const list: Array<{ zve: number; est: number; avg: number; marg: number }> =
      [];
    const count = 10;

    // Default window
    let start = 80_000;
    let end = 180_000;

    if (typeof zve === "number" && isFinite(zve) && zve > 0) {
      const half = Math.max(40_000, Math.round(zve * 0.25));
      start = Math.max(0, Math.round(zve - half));
      end = Math.round(zve + half);
    }

    if (end - start <= 0) return list;

    const interval = (end - start) / (count - 1);
    for (let i = 0; i < count; i++) {
      const z = Math.round(start + i * interval);
      const est = Math.round(estSplitting(z));
      const avg = z > 0 ? est / z : 0;
      const estNext = Math.round(estSplitting(Math.min(z + 100, end + 100)));
      const marg = (estNext - est) / 100;
      list.push({ zve: z, est, avg, marg });
    }
    return list;
  }, [zve]);

  const selectedRow = useMemo(() => {
    if (!selectedZve) return undefined;
    return rows.find((r) => r.zve === selectedZve);
  }, [selectedZve, rows]);

  const actualStats = useMemo(() => {
    if (typeof zve !== "number" || !isFinite(zve) || zve <= 0) return undefined;
    const zRounded = Math.round(zve);
    const estAtZ = estSplitting(zRounded);
    const estAtZp = estSplitting(zRounded + 100);
    const avg = estAtZ / zve;
    const marg = (estAtZp - estAtZ) / 100;
    return { zve: zve, est: Math.round(estAtZ), avg, marg };
  }, [zve]);

  useEffect(() => {
    if (!rows.length) return;
    if (typeof zve === "number" && isFinite(zve)) {
      let closest = rows[0].zve;
      let bestDiff = Math.abs(rows[0].zve - zve);
      for (const r of rows) {
        const d = Math.abs(r.zve - zve);
        if (d < bestDiff) {
          bestDiff = d;
          closest = r.zve;
        }
      }
      setSelectedZve(closest);
    } else if (selectedZve === null) {
      setSelectedZve(rows[Math.floor(rows.length / 2)].zve);
    }
  }, [rows, zve]);

  return (
    <Card>
      <CardHeader>
        <div className="w-full flex items-start justify-between">
          <CardTitle>Splittingtabelle 2025 (Ehepaare)</CardTitle>
          <div className="text-right">
            {actualStats ? (
              <div className="text-sm">
                <div className="font-medium">
                  Aktuell:{" "}
                  {actualStats.zve.toLocaleString("de-DE", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}{" "}
                  €
                </div>
                <div className="text-xs text-muted-foreground">
                  ∅‑Satz: {(actualStats.avg * 100).toFixed(2)} % · Grenz‑Satz:{" "}
                  {(actualStats.marg * 100).toFixed(2)} %
                </div>
              </div>
            ) : selectedRow ? (
              <div className="text-sm">
                <div className="font-medium">
                  Ausgewählt: {selectedRow.zve.toLocaleString("de-DE")} €
                </div>
                <div className="text-xs text-muted-foreground">
                  ∅‑Satz: {(selectedRow.avg * 100).toFixed(2)} % · Grenz‑Satz:{" "}
                  {(selectedRow.marg * 100).toFixed(2)} %
                </div>
              </div>
            ) : (
              <div className="text-sm text-muted-foreground">Keine Auswahl</div>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {typeof zve === "number" && isFinite(zve) && (
          <div className="text-sm text-muted-foreground">
            ZVE gesamt:{" "}
            {zve.toLocaleString("de-DE", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}{" "}
            €
          </div>
        )}

        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>zvE (Splitting)</TableHead>
              <TableHead>ESt</TableHead>
              <TableHead>∅‑Satz</TableHead>
              <TableHead>Grenz‑Satz</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((r) => (
              <TableRow
                key={r.zve}
                data-state={selectedZve === r.zve ? "selected" : undefined}
                className={
                  selectedZve === r.zve ? "bg-primary/10 font-bold" : ""
                }
                onClick={() => setSelectedZve(r.zve)}
                style={{ cursor: "pointer" }}
              >
                <TableCell>{r.zve.toLocaleString("de-DE")} €</TableCell>
                <TableCell>{formatEuro(r.est)} €</TableCell>
                <TableCell>{(r.avg * 100).toFixed(2)} %</TableCell>
                <TableCell>{(r.marg * 100).toFixed(2)} %</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="text-xs text-muted-foreground">
          Werte nach § 32a EStG 2025 (Splittingtarif). Grenz‑Satz als lokale
          Approximation über +100 €.
        </div>
      </CardContent>
    </Card>
  );
}
