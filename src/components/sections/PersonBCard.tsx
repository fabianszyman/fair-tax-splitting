import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useFormContext } from "react-hook-form";
import { formatEuro } from "@/lib/tax/tax2025";
import { PERSON_B_LABEL } from "@/lib/persons";

export function PersonBCard() {
  const { register, watch } = useFormContext();
  const gPersonB = Number(watch("sp_income") || 0);
  const spDonation = Number(watch("sp_donation") || 0);
  const pkvMonth = Number(watch("sp_pkv_month") || 0);
  const stdPersonBInput = Number(watch("sp_std_deduction") || 1230);
  const stdPersonB = stdPersonBInput;
  const personBPart = Math.max(
    0,
    gPersonB - pkvMonth * 12 - spDonation - stdPersonB
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>{PERSON_B_LABEL}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="sp_income">
              Einkommen {PERSON_B_LABEL} (steuerpfl., €)
            </Label>
            <Input
              id="sp_income"
              type="number"
              step={100}
              {...register("sp_income", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-1">
            <Label htmlFor="withheld">
              Schon gezahlte Lohnsteuer {PERSON_B_LABEL} (€/Jahr)
            </Label>
            <Input
              id="withheld"
              type="number"
              step={10}
              {...register("withheld", { valueAsNumber: true })}
            />
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              automatisch berechnen
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="sp_pkv_month">PKV {PERSON_B_LABEL} (mtl., €)</Label>
            <Input
              id="sp_pkv_month"
              type="number"
              step={10}
              {...register("sp_pkv_month", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sp_donation">
              Spenden {PERSON_B_LABEL} (€/Jahr)
            </Label>
            <Input
              id="sp_donation"
              type="number"
              step={10}
              {...register("sp_donation", { valueAsNumber: true })}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sp_std_deduction">
              Pauschale Abzüge ({PERSON_B_LABEL})
            </Label>
            <Input
              id="sp_std_deduction"
              type="number"
              step={1}
              placeholder="1230"
              {...register("sp_std_deduction", { valueAsNumber: true })}
            />
          </div>
        </div>

        <div className="rounded-lg border p-3 text-sm">
          <div className="mb-2 font-medium">Berechnung ZVE‑Anteil</div>
          <div className="flex items-center justify-between">
            <span>Ausgang: Einkommen</span>
            <span>{formatEuro(gPersonB)} €</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>− PKV (mtl. ×12)</span>
            <span>{formatEuro(pkvMonth * 12)} €</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>− Spenden</span>
            <span>{formatEuro(spDonation)} €</span>
          </div>
          <div className="flex items-center justify-between text-muted-foreground">
            <span>− Pauschale Abzüge</span>
            <span>{formatEuro(stdPersonB)} €</span>
          </div>
          <div className="mt-2 border-t pt-2 flex items-center justify-between font-medium">
            <span>ZVE‑Anteil {PERSON_B_LABEL}</span>
            <span>{formatEuro(personBPart)} €</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
