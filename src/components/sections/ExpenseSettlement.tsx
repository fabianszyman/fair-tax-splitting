import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { formatEuro } from "@/lib/tax/tax2025";

type SettlementItem = {
  name?: string;
  gross: number;
  vatRate: number;
  vatAmount: number;
  costBase: number;
  costBaseLabel: "Netto" | "Brutto";
  netExVat: number;
  taxSaving: number;
  marginalRate: number;
  zveWith: number;
  zveWithout: number;
  estWith: number;
  estWithout: number;
  avgRateWith: number;
  avgRateWithout: number;
  paidBy?: "personA" | "personB" | "split";
  share: number;
  personAAlreadyPaid: number;
  outstandingPersonA: number;
  personAShareOfSaving: number;
  suggestedRepay: number;
};

type Props = {
  items: SettlementItem[];
  total: number;
  netSum?: number;
  taxWithoutAll?: number;
  taxWithAll?: number;
  taxDiff?: number;
  selected?: { name: string; gross: number; vatRate: number; net: number }[];
};

export default function ExpenseSettlement({
  items: _items,
  total: _total,
  netSum,
  taxWithoutAll,
  taxWithAll,
  taxDiff,
  selected,
}: Props) {
  const [expanded, setExpanded] = useState(false);
  const selCount = selected ? selected.length : 0;
  const visibleItems =
    selCount > 0 ? (expanded ? selected! : selected!.slice(0, 4)) : [];
  const hiddenCount = Math.max(0, selCount - visibleItems.length);
  const diff = Number(taxDiff ?? 0);
  const diffClass =
    diff > 0
      ? "text-emerald-400"
      : diff < 0
      ? "text-rose-400"
      : "text-muted-foreground";

  return (
    <Card>
      <CardHeader>
        <CardTitle>Betriebsausgaben Steuerersparnis</CardTitle>
        <CardDescription className="mt-1">
          Diese Komponente zeigt, was sich ändern würde, wenn die ausgewählten
          Ausgaben nicht als Betriebsausgaben geltend gemacht würden. Die
          folgenden Zahlen beruhen auf der aktuellen Formular‑Eingabe.
        </CardDescription>
      </CardHeader>

      <CardContent>
        <div className="p-4">
          <div>
            <div className="text-xs text-muted-foreground">
              Netto der ausgewählten Ausgaben
            </div>

            {selCount > 0 ? (
              <div className="mt-2 space-y-2">
                {visibleItems.map((s, idx) => (
                  <div
                    key={idx}
                    className="flex justify-between items-center text-sm"
                  >
                    <div className="flex-1 min-w-0 md:flex md:items-center md:gap-4">
                      <div
                        className="truncate max-w-[60%] md:max-w-[360px]"
                        title={s.name}
                        aria-label={s.name}
                      >
                        {s.name}
                      </div>

                      <div className="hidden md:block text-xs text-muted-foreground">
                        {formatEuro(s.gross)} € • {s.vatRate}% MwSt
                      </div>
                    </div>

                    <div className="ml-4 font-medium">
                      {formatEuro(s.net)} €
                    </div>
                  </div>
                ))}

                {hiddenCount > 0 && (
                  <div className="pt-1">
                    <button
                      type="button"
                      className="text-sm text-primary underline-offset-2 hover:underline"
                      onClick={() => setExpanded((v) => !v)}
                    >
                      {expanded
                        ? `Weniger anzeigen`
                        : `Mehr anzeigen (+${hiddenCount})`}
                    </button>
                  </div>
                )}

                <div className="flex justify-between border-t pt-2 font-semibold">
                  <div>Zwischensumme</div>
                  <div>{formatEuro(netSum ?? 0)} €</div>
                </div>
              </div>
            ) : (
              <div className="mt-2 text-lg font-medium">
                {formatEuro(netSum ?? 0)} €
              </div>
            )}
          </div>

          <div className="mt-4 border-t pt-4 space-y-3 text-sm">
            <div className="flex justify-between">
              <div className="text-muted-foreground">
                Steuer ohne die ausgewählten Ausgaben
              </div>
              <div className="font-medium">
                {formatEuro(taxWithoutAll ?? 0)} €
              </div>
            </div>

            <div className="flex justify-between">
              <div className="text-muted-foreground">
                Steuer mit allen Ausgaben
              </div>
              <div className="font-medium">{formatEuro(taxWithAll ?? 0)} €</div>
            </div>

            <div className="flex justify-between items-center border-t pt-3">
              <div className="text-sm">Steuerdifferenz (Ersparnis)</div>
              <div className={`text-lg font-semibold ${diffClass}`}>
                {formatEuro(taxDiff ?? 0)} €
              </div>
            </div>
          </div>

          <div className="mt-4 text-xs text-muted-foreground">
            Diese Zahlen beruhen auf der aktuellen Formular‑Eingabe. Vorschlag:
            ausgewählte Ausgaben werden 50/50 geteilt.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export type { SettlementItem };
