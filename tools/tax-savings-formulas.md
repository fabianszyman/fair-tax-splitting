Kurzbeschreibung der Datei `tax-savings-template.csv`

Spalten:

- ZVE_before: Euer gemeinsames zu versteuerndes Einkommen vor Abzug (z. B. 80000)
- MarginalRate_pct: angenommener Grenzsteuersatz in Prozent (z. B. 30)
- Deduction: abzuziehender Betrag (z. B. 4000)
- TaxSaving_approx: Approximalrechnung: Deduction \* MarginalRate_pct / 100
- Saving_person: bei 50/50 = TaxSaving_approx \* 0.5
- PaidByPersonA / PaidByPersonB: bereits geleistete Zahlungen (z. B. 2002)
- Transfer_T: vereinfachte Ausgleichsrechnung mit 50/50:
  T = (PaidByPersonA - PaidByPersonB) / 2 (wenn Saving_person gleich für beide)

Beispiele:

- ZVE_before=80000, MarginalRate_pct=30, Deduction=4000 → TaxSaving_approx=1200 → je Person 600

Hinweis:

- Das CSV ist eine einfache Excel/Numbers-Vorlage. Für exakte Berechnung nutze die "Differenz-Methode" (Steuer mit und ohne Abzug) oder einen Steuerrechner/Elster.
