export const PERSON_A_LABEL = "PersonA";
export const PERSON_B_LABEL = "PersonB";

// canonical keys used in form fields and paidBy values
export const PERSON_A_KEY = "personA" as const;
export const PERSON_B_KEY = "personB" as const;

export type PersonKey = typeof PERSON_A_KEY | typeof PERSON_B_KEY | "split";
