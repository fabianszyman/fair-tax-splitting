import { Separator } from "@/components/ui/separator";
import { FormProvider, useForm } from "react-hook-form";
import { PersonACard } from "@/components/sections/PersonACard";
import { PersonBCard } from "@/components/sections/PersonBCard";
import { Results, type ResultsData } from "@/components/sections/Results";
import { SplittingTable } from "@/components/sections/SplittingTable";
import ExpenseSettlement, {
  type SettlementItem,
} from "./components/sections/ExpenseSettlement";
import {
  BBG_JAHR,
  estSplitting,
  KV_RATE,
  soliSimple,
  WITHHELD_RATE,
} from "@/lib/tax/tax2025";
import { ThemeToggle } from "@/components/ThemeToggle";

type ExpenseFormItem = {
  name?: string;
  gross?: number;
  vatRate?: number;
  settle?: boolean;
  paidBy?: "personA" | "personB" | "split";
  share?: number; // PersonA „fairer“ Anteil an der Ausgabe
};

type FormValues = {
  you_profit: number;
  you_kv_paid: number;
  you_donation: number;
  you_std_deduction: number;
  you_expenses?: ExpenseFormItem[];
  sp_income: number;
  withheld: number;
  withheld_auto: boolean;
  sp_pkv_month: number;
  sp_donation: number;
  sp_std_deduction: number;
  soli: boolean;
};

function clampNonNegative(n: number) {
  return Number.isFinite(n) ? Math.max(0, n) : 0;
}

function netFromGross(gross: number, vatRate: number) {
  // Netto (exkl. MwSt) aus Brutto
  return vatRate >= 0 ? gross / (1 + vatRate / 100) : gross;
}

function App() {
  const methods = useForm<FormValues>({
    defaultValues: {
      you_profit: 60_000,
      you_kv_paid: 7_140,
      you_donation: 200,
      you_expenses: [
        {
          name: "Arbeitszimmer Miete",
          gross: 4004,
          vatRate: 0,
          settle: true,
          paidBy: "split",
          share: 0.5,
        },
        {
          name: "Stromkosten Arbeitszimmer",
          gross: 180,
          vatRate: 0,
          settle: true,
          paidBy: "split",
          share: 0.5,
        },
        {
          name: "Apple Studio Display",
          gross: 1850,
          vatRate: 19,
          settle: false,
          paidBy: "personA",
          share: 1,
        },
        {
          name: "Apple Airpods Max",
          gross: 497,
          vatRate: 19,
          settle: false,
          paidBy: "personA",
          share: 1,
        },
      ],
      you_std_deduction: 36,
      // simplified defaults
      sp_income: 67_000,
      withheld: 9_390,
      withheld_auto: true,
      sp_pkv_month: 300,
      sp_donation: 200,
      sp_std_deduction: 1_230,
      soli: false,
    },
  });

  const { watch, setValue } = methods;
  const values = watch();

  // Auto-calc withheld when toggled
  if (values.withheld_auto) {
    const auto =
      Math.round(((values.sp_income || 0) * WITHHELD_RATE) / 10) * 10;
    if (auto !== values.withheld)
      setValue("withheld", auto, { shouldDirty: true });
  }

  function recalc(): ResultsData {
    const gPersonA = clampNonNegative(values.you_profit || 0);
    const expenses = Array.isArray(values.you_expenses)
      ? values.you_expenses
      : [];
    const reclaimVat = true; // always treat VAT as reclaimable (economic net basis)

    // wirtschaftliche Kosten = netto (wenn Vorsteuerabzug) sonst brutto
    const expensesSum = expenses.reduce((s: number, e?: ExpenseFormItem) => {
      const gross = clampNonNegative(Number(e?.gross || 0));
      const rate = Number(e?.vatRate ?? 19);
      const economic = reclaimVat ? netFromGross(gross, rate) : gross;
      return s + economic;
    }, 0);

    const gPersonB = clampNonNegative(values.sp_income || 0);
    const withh = clampNonNegative(values.withheld || 0);
    const youDonation = clampNonNegative(values.you_donation || 0);
    const spDonation = clampNonNegative(values.sp_donation || 0);

    const stdPersonA = clampNonNegative(
      Number.isFinite(values.you_std_deduction as number)
        ? values.you_std_deduction || 0
        : 36
    );
    const stdPersonB = clampNonNegative(
      Number.isFinite(values.sp_std_deduction as number)
        ? values.sp_std_deduction || 0
        : 1230
    );

    const pkvMonth = clampNonNegative(values.sp_pkv_month || 0);
    const useSoli = !!values.soli;

    // Adjust PersonA profit by Betriebsausgaben (wirtschaftliche Kosten)
    const adjustedPersonAProfit = Math.max(0, gPersonA - expensesSum);
    const kvPersonAYear = Math.min(adjustedPersonAProfit, BBG_JAHR) * KV_RATE;
    const kvPersonARest = Math.max(
      0,
      kvPersonAYear - (values.you_kv_paid || 0)
    );

    const personAPart = Math.max(
      0,
      adjustedPersonAProfit - kvPersonAYear - youDonation - stdPersonA
    );
    const personBPart = Math.max(
      0,
      gPersonB - pkvMonth * 12 - spDonation - stdPersonB
    );

    const zve = Math.max(0, personAPart + personBPart);
    const est = estSplitting(zve);
    const avgRate = zve > 0 ? est / zve : 0;
    const soli = useSoli ? soliSimple(est) : 0;
    const taxTotal = est + soli;

    // Split the total tax proportional to each person's share of the ZVE
    const totalParts = personAPart + personBPart;
    const personAShare = totalParts > 0 ? personAPart / totalParts : 0.5;
    const personBShare = 1 - personAShare;

    const fairPersonA = taxTotal * personAShare;
    const fairPersonB = taxTotal * personBShare;

    const outstandingTotal = Math.max(0, taxTotal - withh);
    const restPersonBTax = Math.max(0, fairPersonB - withh);
    const restPersonATax = Math.max(0, outstandingTotal - restPersonBTax);

    return {
      zve,
      est,
      soli,
      taxTotal,
      avgRate,
      fairPersonA: fairPersonA,
      fairPersonB: fairPersonB,
      restPersonATax: restPersonATax,
      restPersonBTax: restPersonBTax,
      personAPart: personAPart,
      personBPart: personBPart,
      kvPersonAYear: kvPersonAYear,
      kvPersonARest: kvPersonARest,
      withheld: withh,
    };
  }

  // Helper: compute tax totals for a given expense list (used to compute per-expense tax-saving)
  function computeTaxForExpenses(expList: ExpenseFormItem[]) {
    const gPersonA = clampNonNegative(values.you_profit || 0);
    const gPersonB = clampNonNegative(values.sp_income || 0);
    const reclaimVat = true; // always use net economic basis (Vorsteuer wird berücksichtigt)

    const expensesSumLocal = Array.isArray(expList)
      ? expList.reduce((s: number, e?: ExpenseFormItem) => {
          const gross = clampNonNegative(Number(e?.gross || 0));
          const rate = Number(e?.vatRate ?? 19);
          const economic = reclaimVat ? netFromGross(gross, rate) : gross;
          return s + economic;
        }, 0)
      : 0;

    // donations used in recalc; not needed here as separate locals

    const stdPersonA = clampNonNegative(
      Number.isFinite(values.you_std_deduction as number)
        ? values.you_std_deduction || 0
        : 36
    );
    const stdPersonB = clampNonNegative(
      Number.isFinite(values.sp_std_deduction as number)
        ? values.sp_std_deduction || 0
        : 1230
    );

    const pkvMonth = clampNonNegative(values.sp_pkv_month || 0);
    const useSoli = !!values.soli;

    const adjustedPersonAProfitLocal = Math.max(0, gPersonA - expensesSumLocal);
    const kvPersonAYearLocal =
      Math.min(adjustedPersonAProfitLocal, BBG_JAHR) * KV_RATE;

    const personAPartLocal = Math.max(
      0,
      adjustedPersonAProfitLocal -
        kvPersonAYearLocal -
        (values.you_donation || 0) -
        stdPersonA
    );
    const personBPartLocal = Math.max(
      0,
      gPersonB - pkvMonth * 12 - (values.sp_donation || 0) - stdPersonB
    );

    const zveLocal = Math.max(0, personAPartLocal + personBPartLocal);
    const estLocal = estSplitting(zveLocal);
    const soliLocal = useSoli ? soliSimple(estLocal) : 0;
    const taxTotalLocal = estLocal + soliLocal;

    return {
      zve: zveLocal,
      est: estLocal,
      soli: soliLocal,
      taxTotal: taxTotalLocal,
    };
  }

  const results = recalc();

  // Build per-expense settlement suggestions based on marginal tax savings
  const allExpenses = Array.isArray(values.you_expenses)
    ? values.you_expenses
    : [];
  const selectedExpenses = allExpenses.filter((e) => e?.settle);
  // Prepare a lightweight display list with net amounts for the selected expenses
  const selectedExpensesDisplay = selectedExpenses.map((e) => {
    const gross = Number(e?.gross || 0);
    const rate = Number(e?.vatRate ?? 19);
    const net = netFromGross(gross, rate);
    return {
      name: e?.name || "Ausgabe",
      gross,
      vatRate: rate,
      net,
    };
  });
  // taxWithAll: Steuer mit allen Ausgaben aus dem Formular (gleich wie in Results)
  const taxWithAll = computeTaxForExpenses(allExpenses);
  // taxWithoutAll: Steuer, wenn die ausgewählten Ausgaben NICHT geltend gemacht würden
  const taxWithoutAll = computeTaxForExpenses(
    allExpenses.filter((e) => !e?.settle)
  );

  // Always use aggregated 50/50 settlement: compute total tax saving (difference) and split it
  const grossSum = selectedExpenses.reduce(
    (s: number, e: any) => s + Number(e?.gross || 0),
    0
  );
  const netSum = selectedExpenses.reduce((s: number, e: any) => {
    const gross = Number(e?.gross || 0);
    const rate = Number(e?.vatRate ?? 19);
    const net = netFromGross(gross, rate); // Vorsteuer immer berücksichtigt
    return s + net;
  }, 0);

  // Steuerdifferenz: Steuer ohne die ausgewählten Ausgaben minus Steuer mit
  // den ausgewählten Ausgaben => Einsparung durch Geltendmachung
  const totalTaxSaving = Math.max(
    0,
    taxWithoutAll.taxTotal - taxWithAll.taxTotal
  );
  const perPersonSaving = totalTaxSaving / 2;

  const settlements: SettlementItem[] = [
    {
      name: "Ausgewählte Ausgaben (gesamt)",
      gross: grossSum,
      vatRate: 0,
      vatAmount: Math.max(0, grossSum - netSum),
      costBase: netSum,
      costBaseLabel: "Netto",
      netExVat: netSum,
      taxSaving: totalTaxSaving,
      marginalRate: netSum > 0 ? totalTaxSaving / netSum : 0,
      zveWith: taxWithAll.zve ?? 0,
      zveWithout: taxWithoutAll.zve ?? 0,
      estWith: taxWithAll.est ?? 0,
      estWithout: taxWithoutAll.est ?? 0,
      avgRateWith: taxWithAll.zve ? taxWithAll.est / taxWithAll.zve : 0,
      avgRateWithout: taxWithoutAll.zve
        ? taxWithoutAll.est / taxWithoutAll.zve
        : 0,
      paidBy: "split",
      share: 0.5,
      personAAlreadyPaid: 0,
      outstandingPersonA: netSum / 2,
      personAShareOfSaving: perPersonSaving,
      suggestedRepay: perPersonSaving,
    },
  ];

  const totalSuggestedRepay = settlements.reduce(
    (s, it) => s + it.suggestedRepay,
    0
  );

  return (
    <FormProvider {...methods}>
      <div className="container py-8">
        <header className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h1 className="text-xl font-semibold">
              Fairer Steuer-Splitting-Rechner
            </h1>
            <p className="text-sm text-muted-foreground">
              Exakter §32a EStG 2025 – Splittingtarif. PWA, offline-fähig.
              shadcn/ui + Tailwind.
            </p>
          </div>
          <ThemeToggle />
        </header>

        <div className="grid gap-4 md:grid-cols-2">
          <PersonACard />
          <PersonBCard />
        </div>

        <Separator className="my-6" />

        <div className="grid gap-4 md:grid-cols-2">
          <Results data={results} />
          <SplittingTable zve={results.zve} />
        </div>

        <Separator className="my-6" />

        <div className="mt-4">
          <ExpenseSettlement
            items={settlements}
            total={totalSuggestedRepay}
            netSum={netSum}
            taxWithoutAll={taxWithoutAll.taxTotal}
            taxWithAll={taxWithAll.taxTotal}
            taxDiff={totalTaxSaving}
            selected={selectedExpensesDisplay}
          />
        </div>
      </div>
    </FormProvider>
  );
}

export default App;
