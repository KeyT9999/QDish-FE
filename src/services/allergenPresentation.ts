type AllergenInfoStatus = 'UNKNOWN' | 'REVIEWED';
type AllergenCode = 'GLUTEN' | 'DAIRY' | 'PEANUT' | 'TREE_NUTS' | 'SESAME' | 'SHELLFISH' | 'SOY' | 'EGGS' | 'FISH';

type MenuAllergenInput = {
  allergenInfoStatus?: AllergenInfoStatus;
  /** Ingredient-derived candidates. These are not a complete declaration. */
  allergens?: readonly string[];
  /** Final contains list confirmed by restaurant staff. */
  reviewedAllergens?: readonly string[];
  /** Cross-contact disclosure confirmed by restaurant staff. */
  mayContainAllergens?: readonly string[];
};

type MenuAllergenWarning =
  | { kind: 'NONE' }
  | { kind: 'UNKNOWN'; informationIncomplete: true; message: string }
  | {
      kind: 'CONFLICT';
      codes: AllergenCode[];
      source: 'CANDIDATE' | 'CONTAINS' | 'MAY_CONTAIN' | 'MIXED';
      informationIncomplete: boolean;
      message: string;
    };

const ALLERGEN_ORDER: readonly AllergenCode[] = [
  'GLUTEN',
  'DAIRY',
  'PEANUT',
  'TREE_NUTS',
  'SESAME',
  'SHELLFISH',
  'SOY',
  'EGGS',
  'FISH'
];

const LEGACY_ALLERGEN_ALIASES: Readonly<Record<string, readonly AllergenCode[]>> = {
  NUTS: ['PEANUT', 'TREE_NUTS']
};

const ALLERGEN_LABELS: Record<AllergenCode, string> = {
  GLUTEN: 'gluten',
  DAIRY: 'sữa',
  PEANUT: 'đậu phộng',
  TREE_NUTS: 'hạt cây',
  SESAME: 'mè',
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
    const expanded = LEGACY_ALLERGEN_ALIASES[code]
      ?? (ALLERGEN_ORDER.includes(code as AllergenCode) ? [code as AllergenCode] : undefined);
    if (!expanded) return undefined;
    expanded.forEach((allergen) => normalized.add(allergen));
  }

  return ALLERGEN_ORDER.filter((code) => normalized.has(code));
}

function normalizeSupportedAllergens(value: unknown): AllergenCode[] {
  if (!Array.isArray(value)) return [];
  const normalized = new Set<AllergenCode>();
  for (const entry of value) {
    if (typeof entry !== 'string') continue;
    const code = entry.trim().toUpperCase();
    const expanded = LEGACY_ALLERGEN_ALIASES[code]
      ?? (ALLERGEN_ORDER.includes(code as AllergenCode) ? [code as AllergenCode] : undefined);
    expanded?.forEach((allergen) => normalized.add(allergen));
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

function getReviewedDeclaration(item: MenuAllergenInput): { contains: AllergenCode[]; mayContain: AllergenCode[] } | undefined {
  const contains = normalizeAllergens(item.reviewedAllergens);
  const mayContain = normalizeAllergens(item.mayContainAllergens);
  if (!contains || !mayContain) return undefined;
  if (contains.some((code) => mayContain.includes(code))) return undefined;
  return { contains, mayContain };
}

export function hasReviewedAllergenDeclaration(item: MenuAllergenInput): boolean {
  return item.allergenInfoStatus === 'REVIEWED' && getReviewedDeclaration(item) !== undefined;
}

export function getMenuAllergenWarning(
  item: MenuAllergenInput,
  reportedAllergies: readonly string[]
): MenuAllergenWarning {
  const reported = new Set(normalizeSupportedAllergens(reportedAllergies));
  const baseUnknownMessage = 'Chưa xác minh đầy đủ thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.';

  const declaration = hasReviewedAllergenDeclaration(item) ? getReviewedDeclaration(item) : undefined;
  if (!declaration) {
    const candidates = normalizeSupportedAllergens(item.allergens);
    const candidateConflicts = candidates?.filter((code) => reported.has(code)) ?? [];
    if (candidateConflicts.length === 0) {
      return { kind: 'UNKNOWN', informationIncomplete: true, message: baseUnknownMessage };
    }

    return {
      kind: 'CONFLICT',
      codes: candidateConflicts,
      source: 'CANDIDATE',
      informationIncomplete: true,
      message: `Món này có thể chứa ${displayAllergens(candidateConflicts)} bạn đã khai báo dị ứng. Thông tin dị ứng của món chưa được xác minh.`
    };
  }

  const containsConflicts = declaration.contains.filter((code) => reported.has(code));
  const mayContainConflicts = declaration.mayContain.filter((code) => reported.has(code));
  if (containsConflicts.length === 0 && mayContainConflicts.length === 0) return { kind: 'NONE' };

  const source = containsConflicts.length > 0 && mayContainConflicts.length > 0
    ? 'MIXED'
    : containsConflicts.length > 0 ? 'CONTAINS' : 'MAY_CONTAIN';
  const codes = ALLERGEN_ORDER.filter((code) => containsConflicts.includes(code) || mayContainConflicts.includes(code));
  const statements = [
    containsConflicts.length > 0 ? `có chứa ${displayAllergens(containsConflicts)}` : '',
    mayContainConflicts.length > 0 ? `có thể chứa ${displayAllergens(mayContainConflicts)}` : ''
  ].filter(Boolean).join(' và ');

  return {
    kind: 'CONFLICT',
    codes,
    source,
    informationIncomplete: false,
    message: `Món này ${statements} bạn đã khai báo dị ứng.`
  };
}

export function formatOrderAllergenWarning(item: {
  allergenInfoStatus?: AllergenInfoStatus;
  allergenWarnings?: readonly string[];
  allergenContainsWarnings?: readonly string[];
  allergenMayContainWarnings?: readonly string[];
  allergenWarningSource?: 'CANDIDATE' | 'CONTAINS' | 'MAY_CONTAIN' | 'MIXED';
  allergenInformationIncomplete?: boolean;
  reportedAllergies?: readonly string[];
  allergyDisclosureStatus?: 'NOT_ANSWERED' | 'NONE_DECLARED' | 'DECLARED';
}): string | null {
  const warnings = normalizeAllergens(item.allergenWarnings);
  if (item.allergenInfoStatus === 'REVIEWED' && warnings) {
    const reported = normalizeSupportedAllergens(item.reportedAllergies);
    const reportedText = reported.length > 0
      ? `Khách khai báo dị ứng: ${displayAllergensForStaff(reported)}. `
      : '';
    if (warnings.length === 0) {
      return reported.length > 0
        ? `${reportedText}Món đã xác minh, không có xung đột với allergen khách khai báo.`
        : null;
    }
    const contains = normalizeAllergens(item.allergenContainsWarnings) ?? (
      item.allergenWarningSource === 'CONTAINS' ? warnings : []
    );
    const mayContain = normalizeAllergens(item.allergenMayContainWarnings) ?? (
      item.allergenWarningSource === 'MAY_CONTAIN' ? warnings : []
    );
    const details = [
      contains.length > 0 ? `có chứa ${displayAllergensForStaff(contains)}` : '',
      mayContain.length > 0 ? `có thể chứa do lây nhiễm chéo ${displayAllergensForStaff(mayContain)}` : ''
    ].filter(Boolean).join('; ');
    const description = details || `có cảnh báo allergen: ${displayAllergensForStaff(warnings)}`;
    return `${reportedText}Món ${description}.`;
  }

  const reported = normalizeSupportedAllergens(item.reportedAllergies);
  if (reported.length > 0) {
    const candidates = warnings?.length ? ` Ứng viên của món: ${displayAllergensForStaff(warnings)}.` : '';
    return `Khách khai báo dị ứng: ${displayAllergensForStaff(reported)}.${candidates} Thông tin món chưa xác minh; cần nhân viên đối chiếu.`;
  }
  if (item.allergyDisclosureStatus === 'NONE_DECLARED') {
    return 'Khách xác nhận không có dị ứng đã biết; thông tin allergen của món chưa xác minh.';
  }
  if (item.allergyDisclosureStatus === 'NOT_ANSWERED') {
    return 'Khách chưa trả lời khảo sát dị ứng; thông tin allergen của món chưa xác minh.';
  }
  return 'Cần xác nhận thông tin dị ứng món.';
}
