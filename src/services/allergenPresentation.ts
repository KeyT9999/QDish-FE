type AllergenInfoStatus = 'UNKNOWN' | 'REVIEWED';
type AllergenCode = 'GLUTEN' | 'DAIRY' | 'NUTS' | 'SHELLFISH' | 'SOY' | 'EGGS' | 'FISH';

type MenuAllergenInput = {
  allergenInfoStatus?: AllergenInfoStatus;
  allergens?: readonly string[];
};

type MenuAllergenWarning =
  | { kind: 'NONE' }
  | { kind: 'UNKNOWN'; message: string }
  | { kind: 'CONFLICT'; codes: AllergenCode[]; message: string };

const ALLERGEN_ORDER: readonly AllergenCode[] = [
  'GLUTEN',
  'DAIRY',
  'NUTS',
  'SHELLFISH',
  'SOY',
  'EGGS',
  'FISH'
];

const ALLERGEN_LABELS: Record<AllergenCode, string> = {
  GLUTEN: 'gluten',
  DAIRY: 'sữa',
  NUTS: 'các loại hạt',
  SHELLFISH: 'hải sản có vỏ',
  SOY: 'đậu nành',
  EGGS: 'trứng',
  FISH: 'cá'
};

function normalizeAllergens(value: unknown): AllergenCode[] | undefined {
  if (!Array.isArray(value)) return undefined;

  const normalized = new Set<AllergenCode>();
  for (const entry of value) {
    if (typeof entry !== 'string') return undefined;
    const code = entry.trim().toUpperCase();
    if (!ALLERGEN_ORDER.includes(code as AllergenCode)) return undefined;
    normalized.add(code as AllergenCode);
  }

  return ALLERGEN_ORDER.filter((code) => normalized.has(code));
}

function displayAllergens(codes: readonly AllergenCode[]): string {
  return codes.map((code) => ALLERGEN_LABELS[code]).join(', ');
}

function displayAllergensForStaff(codes: readonly AllergenCode[]): string {
  const labels = displayAllergens(codes);
  return labels.length > 0 ? labels[0].toUpperCase() + labels.slice(1) : labels;
}

export function getMenuAllergenWarning(
  item: MenuAllergenInput,
  reportedAllergies: readonly string[]
): MenuAllergenWarning {
  const declared = normalizeAllergens(item.allergens);
  if (item.allergenInfoStatus !== 'REVIEWED' || !declared) {
    return {
      kind: 'UNKNOWN',
      message: 'Chưa xác nhận thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.'
    };
  }

  const reported = new Set(normalizeAllergens(reportedAllergies) ?? []);
  const conflicts = declared.filter((code) => reported.has(code));
  if (conflicts.length === 0) return { kind: 'NONE' };

  return {
    kind: 'CONFLICT',
    codes: conflicts,
    message: `Món này có chứa ${displayAllergens(conflicts)} bạn đã khai báo dị ứng.`
  };
}

export function formatOrderAllergenWarning(item: {
  allergenInfoStatus?: AllergenInfoStatus;
  allergenWarnings?: readonly string[];
  reportedAllergies?: readonly string[];
}): string | null {
  const warnings = normalizeAllergens(item.allergenWarnings);
  if (item.allergenInfoStatus === 'REVIEWED' && warnings) {
    if (warnings.length === 0) return null;
    const reported = normalizeAllergens(item.reportedAllergies) ?? [];
    const reportedText = reported.length > 0
      ? `Khách khai báo dị ứng: ${displayAllergensForStaff(reported)}. `
      : '';
    return `${reportedText}Món có khai báo chứa: ${displayAllergensForStaff(warnings)}.`;
  }

  const reported = normalizeAllergens(item.reportedAllergies) ?? [];
  if (reported.length > 0) {
    return `Khách khai báo dị ứng: ${displayAllergensForStaff(reported)}; cần xác nhận thông tin dị ứng món.`;
  }
  return 'Cần xác nhận thông tin dị ứng món.';
}
