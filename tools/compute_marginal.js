// Kurzes Rechen-Skript zur Replikation der Logik in src/lib/tax/tax2025.ts und App.tsx
const KV_RATE = 0.197;
const BBG_JAHR = 62100;

function clampFloorEuros(value) {
  return Math.floor(Math.max(0, value || 0));
}

function estGrundtarif2025(x) {
  const z = clampFloorEuros(x);
  if (z <= 12096) return 0;
  if (z <= 17443) {
    const y = (z - 12096) / 10000;
    return (932.3 * y + 1400) * y;
  }
  if (z <= 68480) {
    const y = (z - 17443) / 10000;
    return (176.64 * y + 2397) * y + 1015.13;
  }
  if (z <= 277825) return 0.42 * z - 10911.92;
  return 0.45 * z - 19246.67;
}

function estSplitting(zveJoint) {
  return 2 * estGrundtarif2025((zveJoint || 0) / 2);
}

function soliSimple(incomeTax) {
  const thresh = 33912;
  if (incomeTax <= thresh) return 0;
  const excess = incomeTax - thresh;
  return Math.min(0.055 * incomeTax, 0.2 * excess);
}

function netFromGross(gross, vatRate) {
  return vatRate >= 0 ? gross / (1 + vatRate / 100) : gross;
}

// Default values matching App.tsx defaults
const values = {
  you_profit: 65000,
  you_kv_paid: 7140,
  you_donation: 200,
  you_std_deduction: 36,
  sp_income: 67000,
  withheld: 9390,
  withheld_auto: true,
  sp_pkv_month: 300,
  sp_donation: 200,
  sp_std_deduction: 1230,
  soli: false,
};

function computeTaxForExpenses(expList) {
  const gPersonA = Math.max(0, values.you_profit || 0);
  const gPersonB = Math.max(0, values.sp_income || 0);
  const reclaimVat = true;

  const expensesSumLocal = Array.isArray(expList)
    ? expList.reduce((s, e) => {
        const gross = Math.max(0, Number(e?.gross || 0));
        const rate = Number(e?.vatRate ?? 19);
        const economic = reclaimVat ? netFromGross(gross, rate) : gross;
        return s + economic;
      }, 0)
    : 0;

  const stdPersonA = Number.isFinite(values.you_std_deduction)
    ? values.you_std_deduction || 0
    : 36;
  const stdPersonB = Number.isFinite(values.sp_std_deduction)
    ? values.sp_std_deduction || 0
    : 1230;
  const pkvMonth = Math.max(0, values.sp_pkv_month || 0);
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

// Inputs from your screenshots / defaults
const actualZve = 109130.06; // from screenshot
const expense = {
  name: "Arbeitszimmer Miete",
  gross: 4004,
  vatRate: 0,
  settle: true,
  paidBy: "split",
  share: 0.5,
};

const taxWithoutAll = computeTaxForExpenses([]);
const taxWithAll = computeTaxForExpenses([expense]);
const netSum = netFromGross(expense.gross, expense.vatRate);
const totalTaxSaving = Math.max(
  0,
  taxWithoutAll.taxTotal - taxWithAll.taxTotal
);

// local derivative at actualZve using estSplitting (as SplittingTable uses estSplitting)
const zRounded = Math.round(actualZve);
const estAtZ = estSplitting(zRounded);
const estAtZp = estSplitting(zRounded + 100);
const avg = estAtZ / actualZve;
const marg = (estAtZp - estAtZ) / 100;

console.log("computeTaxForExpenses([]) =>", taxWithoutAll);
console.log("computeTaxForExpenses([expense]) =>", taxWithAll);
console.log("netSum", netSum.toFixed(2));
console.log("totalTaxSaving", totalTaxSaving.toFixed(2));
console.log(
  "effective marginal (totalTaxSaving / netSum) % =",
  ((totalTaxSaving / netSum) * 100).toFixed(4)
);
console.log(
  "local estSplitting derivative at ZVE",
  zRounded,
  "avg % =",
  (avg * 100).toFixed(4),
  "marg % =",
  (marg * 100).toFixed(4)
);

console.log("estAtZ", estAtZ.toFixed(2), "estAtZp", estAtZp.toFixed(2));

// also print difference values for insight
console.log(
  "taxWithoutAll.taxTotal - taxWithAll.taxTotal =",
  (taxWithoutAll.taxTotal - taxWithAll.taxTotal).toFixed(2)
);
console.log(
  "taxWithoutAll.est, taxWithAll.est :",
  taxWithoutAll.est.toFixed(2),
  taxWithAll.est.toFixed(2)
);
console.log(
  "zve without, zve with:",
  taxWithoutAll.zve.toFixed(2),
  taxWithAll.zve.toFixed(2)
);
