import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatEuro } from "@/lib/tax/tax2025";
import { PERSON_A_LABEL, PERSON_B_LABEL } from "@/lib/persons";

export type ResultsData = {
  zve: number;
  est: number;
  soli: number;
  taxTotal: number;
  avgRate: number;
  fairPersonA: number;
  fairPersonB: number;
  restPersonATax: number;
  restPersonBTax: number;
  personAPart?: number;
  personBPart?: number;
  kvPersonAYear: number;
  kvPersonARest: number;
  withheld: number;
};

export function Results({ data }: { data: ResultsData | null }) {
  if (!data) return null;
  const {
    zve,
    soli,
    taxTotal,
    avgRate,
    fairPersonA,
    fairPersonB,
    restPersonATax,
    restPersonBTax,
    personAPart,
    personBPart,
    kvPersonAYear,
    kvPersonARest,
    withheld,
  } = data;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ergebnisse</CardTitle>
      </CardHeader>

      <CardContent>
        {/* Top metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-3">
          <div className="rounded-md border p-4">
            <div className="text-xs text-muted-foreground">ZVE gesamt</div>
            <div className="text-lg font-semibold">{formatEuro(zve)} €</div>
          </div>

          <div className="rounded-md border p-4">
            <div className="text-xs text-muted-foreground">Gesamtsteuer</div>
            <div className="text-lg font-semibold">
              {formatEuro(taxTotal)} €
            </div>
            <div className="text-xs text-muted-foreground">
              {soli > 0 ? `inkl. Soli ${formatEuro(soli)} €` : "ohne Soli"}
            </div>
          </div>

          <div className="rounded-md border p-4">
            <div className="text-xs text-muted-foreground">∅‑Steuersatz</div>
            <div className="text-lg font-semibold">
              {(avgRate * 100).toFixed(2)} %
            </div>
          </div>
        </div>

        {/* Detail columns */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-md border p-4">
            <h3 className="mb-3 text-sm font-medium">{PERSON_A_LABEL}</h3>
            <dl className="grid grid-cols-1 gap-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Steueranteil (theoretisch)
                </dt>
                <dd className="font-medium">{formatEuro(fairPersonA)} €</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Anteil am ZVE</dt>
                <dd className="font-medium">
                  {personAPart && zve
                    ? ((personAPart / zve) * 100).toFixed(1)
                    : "—"}
                  %
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">KV Jahr (berechnet)</dt>
                <dd className="font-medium">{formatEuro(kvPersonAYear)} €</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Rest KV</dt>
                <dd className="font-medium">{formatEuro(kvPersonARest)} €</dd>
              </div>

              <div className="flex justify-between border-t pt-2">
                <dt className="text-sm">Rest Steuer</dt>
                <dd className="text-sm font-semibold">
                  {formatEuro(restPersonATax)} €
                </dd>
              </div>
            </dl>
          </div>

          <div className="rounded-md border p-4">
            <h3 className="mb-3 text-sm font-medium">{PERSON_B_LABEL}</h3>
            <dl className="grid grid-cols-1 gap-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Steueranteil (theoretisch)
                </dt>
                <dd className="font-medium">{formatEuro(fairPersonB)} €</dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">Anteil am ZVE</dt>
                <dd className="font-medium">
                  {personBPart && zve
                    ? ((personBPart / zve) * 100).toFixed(1)
                    : "—"}{" "}
                  %
                </dd>
              </div>

              <div className="flex justify-between">
                <dt className="text-muted-foreground">
                  Schon gezahlte Lohnsteuer
                </dt>
                <dd className="font-medium">{formatEuro(withheld)} €</dd>
              </div>

              <div className="flex justify-between border-t pt-2">
                <dt className="text-sm">Rest Steuer</dt>
                <dd className="text-sm font-semibold">
                  {formatEuro(restPersonBTax)} €
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
