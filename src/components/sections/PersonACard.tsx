import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useFormContext, useFieldArray } from "react-hook-form";
import { BBG_JAHR, KV_RATE, formatEuro } from "@/lib/tax/tax2025";

import { PERSON_A_LABEL } from "@/lib/persons";

export function PersonACard() {
  const { register, watch, control } = useFormContext();
  const { fields, append, remove } = useFieldArray({
    control,
    name: "you_expenses",
  });
  const paidYear = Number(watch("you_kv_paid") || 0);
  const gPersonA = Number(watch("you_profit") || 0);
  const youExpenses = watch("you_expenses") || [];
  // User enters Brutto; VAT is calculated automatically. Only Netto is abzugsfähig.
  const youExpensesTotal = (
    Array.isArray(youExpenses) ? youExpenses : []
  ).reduce((s: number, e: any) => {
    const gross = Number(e?.gross || 0);
    const rate = Number(e?.vatRate ?? 19);
    const net = rate >= 0 ? gross / (1 + rate / 100) : gross;
    return s + net;
  }, 0);
  const youDonation = Number(watch("you_donation") || 0);
  const stdPersonAInput = Number(watch("you_std_deduction") || 36);
  // Adjust profit by Betriebsausgaben
  const adjustedPersonAProfit = Math.max(0, gPersonA - youExpensesTotal);
  const kvPersonAYear = Math.min(adjustedPersonAProfit, BBG_JAHR) * KV_RATE;
  const stdPersonA = stdPersonAInput;
  const personAPart = Math.max(
    0,
    adjustedPersonAProfit - kvPersonAYear - youDonation - stdPersonA
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{PERSON_A_LABEL}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="you_profit">Gewinn {PERSON_A_LABEL} (EÜR, €)</Label>
            <Input
              id="you_profit"
              type="number"
              step={100}
              {...register("you_profit", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="you_kv_paid">
              Schon gezahlte KV {PERSON_A_LABEL} (€/Jahr)
            </Label>
            <Input
              id="you_kv_paid"
              type="number"
              step={10}
              {...register("you_kv_paid", { valueAsNumber: true })}
            />
            <div className="text-xs text-muted-foreground">
              ≈{" "}
              {(paidYear / 12).toLocaleString("de-DE", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}{" "}
              €/Monat
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="you_donation">
              Spenden {PERSON_A_LABEL} (€/Jahr)
            </Label>
            <Input
              id="you_donation"
              type="number"
              step={10}
              {...register("you_donation", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="you_std_deduction">
              Pauschale Abzüge ({PERSON_A_LABEL})
            </Label>
            <Input
              id="you_std_deduction"
              type="number"
              step={1}
              placeholder="36"
              {...register("you_std_deduction", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="rounded-md border p-4 text-sm">
          <div className="mb-2 font-medium">
            Betriebsausgaben ({PERSON_A_LABEL})
          </div>
          <div className="space-y-2">
            {fields.map((f, idx) => {
              const entry = youExpenses[idx] || {};
              const gross = Number(entry?.gross || 0);
              const vatRate = Number(entry?.vatRate ?? 19);
              const net = vatRate >= 0 ? gross / (1 + vatRate / 100) : gross;
              const vat = gross - net;
              return (
                <div key={f.id} className="space-y-2">
                  <div className="flex flex-col gap-2">
                    <Input
                      className="w-full"
                      placeholder="Beschreibung"
                      {...register(`you_expenses.${idx}.name`)}
                    />
                    <div className="grid grid-cols-3 gap-2 items-center">
                      <Input
                        type="number"
                        step={1}
                        className="col-span-1 w-full"
                        placeholder="Brutto"
                        {...register(`you_expenses.${idx}.gross`, {
                          valueAsNumber: true,
                        })}
                      />
                      <Input
                        type="number"
                        step={0.1}
                        className="col-span-1 w-full"
                        placeholder="USt %"
                        {...register(`you_expenses.${idx}.vatRate`, {
                          valueAsNumber: true,
                        })}
                      />
                      <div className="col-span-1 flex items-center gap-2">
                        <input
                          type="checkbox"
                          className=""
                          {...register(`you_expenses.${idx}.settle`)}
                        />
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => remove(idx)}
                        >
                          Entfernen
                        </Button>
                      </div>
                    </div>

                    <div className="text-sm text-muted-foreground">
                      Netto: {formatEuro(net)} € · USt: {formatEuro(vat)} €
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="flex items-center gap-2">
              <Button
                type="button"
                onClick={() =>
                  append({ name: "", gross: 0, vatRate: 19, settle: false })
                }
              >
                + Ausgabe hinzufügen
              </Button>
              <div className="ml-auto text-sm text-muted-foreground">
                Summe: {formatEuro(youExpensesTotal)} €
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-md border p-4 text-sm">
          <div className="mb-2 font-medium">Berechnung ZVE‑Anteil</div>
          <div className="flex items-center justify-between">
            <span>Ausgang: Gewinn (brutto)</span>
            <span>{formatEuro(gPersonA)} €</span>
          </div>
          {youExpensesTotal > 0 && (
            <div className="flex items-center justify-between text-muted-foreground">
              <span>− Betriebsausgaben</span>
              <span>{formatEuro(youExpensesTotal)} €</span>
            </div>
          )}
          <div className="flex items-center justify-between text-muted-foreground">
            <span>− KV (berechnet)</span>
            <span>{formatEuro(kvPersonAYear)} €</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>− Spenden</span>
            <span>{formatEuro(youDonation)} €</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>− Pauschale Abzüge</span>
            <span>{formatEuro(stdPersonA)} €</span>
          </div>
          <div className="mt-2 border-t pt-2 flex items-center justify-between font-medium">
            <span>ZVE‑Anteil {PERSON_A_LABEL}</span>
            <span>{formatEuro(personAPart)} €</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
