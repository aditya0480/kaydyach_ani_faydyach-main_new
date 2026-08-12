export const CONSULTATION_CATEGORIES = [
  { value: "property", label: "मालमत्ता (Property)" },
  { value: "family", label: "कौटुंबिक / घटस्फोट (Family / Divorce)" },
  { value: "consumer", label: "ग्राहक तक्रार (Consumer)" },
  { value: "labor", label: "कामगार / नोकरी (Labor / Employment)" },
  { value: "criminal", label: "फौजदारी (Criminal)" },
  { value: "rti", label: "माहिती अधिकार (RTI)" },
  { value: "other", label: "इतर (Other)" },
] as const;

export type ConsultationCategory = (typeof CONSULTATION_CATEGORIES)[number]["value"];

export const CONSULTATION_CATEGORY_VALUES = CONSULTATION_CATEGORIES.map((c) => c.value) as [
  ConsultationCategory,
  ...ConsultationCategory[],
];

export function consultationCategoryLabel(value: string): string {
  return CONSULTATION_CATEGORIES.find((c) => c.value === value)?.label ?? value;
}
