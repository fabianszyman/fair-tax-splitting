export type Euros = number;

export const KV_RATE = 0.197; // Schätzwert KV+PV für Selbstständige
export const BBG_JAHR: Euros = 62_100;
export const WITHHELD_RATE = 0.14; // ≈14 % angenommene Lohnsteuer (Used for auto-withheld estimate)

function clampFloorEuros(value: number): Euros {
  return Math.floor(Math.max(0, value || 0));
}

// EXAKT §32a EStG 2025 Grundtarif
export function estGrundtarif2025(x: Euros): Euros {
  const z = clampFloorEuros(x);
  if (z <= 12_096) return 0;
  if (z <= 17_443) {
    const y = (z - 12_096) / 10_000;
    return (932.3 * y + 1400) * y;
  }
  if (z <= 68_480) {
    const y = (z - 17_443) / 10_000;
    return (176.64 * y + 2397) * y + 1015.13;
  }
  if (z <= 277_825) return 0.42 * z - 10_911.92;
  return 0.45 * z - 19_246.67;
}

export const estSplitting = (zveJoint: Euros): Euros =>
  2 * estGrundtarif2025((zveJoint || 0) / 2);

export function soliSimple(incomeTax: Euros): Euros {
  const thresh = 33_912;
  if (incomeTax <= thresh) return 0;
  const excess = incomeTax - thresh;
  return Math.min(0.055 * incomeTax, 0.2 * excess);
}

export function formatEuro(value: number): string {
  return value.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function formatEuroSigned(value: number): string {
  const sign = value < 0 ? '-' : '';
  const v = Math.abs(value);
  return sign + formatEuro(v);
}
