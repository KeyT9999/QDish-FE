type AllergenInfoStatus = 'UNKNOWN' | 'REVIEWED';
type MenuLocale = import('@/types/menuTranslation').MenuLocale;
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

const ALLERGEN_LABELS: Record<AllergenCode, Record<MenuLocale, string>> = {
  GLUTEN: { vi: 'gluten', en: 'gluten', 'zh-CN': '麸质', ru: 'глютен', ko: '글루텐', 'hi-IN': 'ग्लूटेन' },
  DAIRY: { vi: 'sữa', en: 'dairy', 'zh-CN': '乳制品', ru: 'молочные продукты', ko: '유제품', 'hi-IN': 'डेयरी उत्पाद' },
  PEANUT: { vi: 'đậu phộng', en: 'peanuts', 'zh-CN': '花生', ru: 'арахис', ko: '땅콩', 'hi-IN': 'मूंगफली' },
  TREE_NUTS: { vi: 'hạt cây', en: 'tree nuts', 'zh-CN': '树坚果', ru: 'древесные орехи', ko: '견과류', 'hi-IN': 'वृक्षों पर उगने वाले मेवे' },
  SESAME: { vi: 'mè', en: 'sesame', 'zh-CN': '芝麻', ru: 'кунжут', ko: '참깨', 'hi-IN': 'तिल' },
  SHELLFISH: { vi: 'hải sản có vỏ', en: 'shellfish', 'zh-CN': '甲壳类海鲜', ru: 'моллюски и ракообразные', ko: '갑각류 및 조개류', 'hi-IN': 'शेलफिश' },
  SOY: { vi: 'đậu nành', en: 'soy', 'zh-CN': '大豆', ru: 'соя', ko: '대두', 'hi-IN': 'सोया' },
  EGGS: { vi: 'trứng', en: 'eggs', 'zh-CN': '鸡蛋', ru: 'яйца', ko: '달걀', 'hi-IN': 'अंडे' },
  FISH: { vi: 'cá', en: 'fish', 'zh-CN': '鱼类', ru: 'рыба', ko: '생선', 'hi-IN': 'मछली' }
};

function getUnknownAllergenMessage(locale: MenuLocale): string {
  switch (locale) {
    case 'en': return 'Allergen information for this dish is not fully verified. Ask staff if you have an allergy.';
    case 'zh-CN': return '这道菜的过敏原信息尚未完全核实。如有过敏，请咨询工作人员。';
    case 'ru': return 'Информация об аллергенах в этом блюде проверена не полностью. Если у вас есть аллергия, обратитесь к сотруднику.';
    case 'ko': return '이 메뉴의 알레르기 정보가 완전히 확인되지 않았습니다. 알레르기가 있다면 직원에게 문의하세요.';
    case 'hi-IN': return 'इस व्यंजन में मौजूद एलर्जी कारकों की जानकारी पूरी तरह सत्यापित नहीं है। यदि आपको एलर्जी है, तो कृपया कर्मचारी से पूछें।';
    default: return 'Chưa xác minh đầy đủ thông tin dị ứng của món này. Hãy hỏi nhân viên nếu bạn bị dị ứng.';
  }
}

function getUnverifiedConflictMessage(codes: readonly AllergenCode[], locale: MenuLocale): string {
  const allergens = displayAllergens(codes, locale);
  switch (locale) {
    case 'en': return `This dish may contain ${allergens}, which you reported as an allergy. Allergen information has not been verified.`;
    case 'zh-CN': return `这道菜可能含有您申报过敏的${allergens}，过敏原信息尚未核实。`;
    case 'ru': return `Это блюдо может содержать ${allergens}, на которые вы указали аллергию. Информация об аллергенах не проверена.`;
    case 'ko': return `이 메뉴에는 알레르기가 있다고 알려 주신 ${allergens}이(가) 포함되어 있을 수 있습니다. 알레르기 정보는 아직 확인되지 않았습니다.`;
    case 'hi-IN': return `इस व्यंजन में ${allergens} हो सकते हैं, जिनसे आपको एलर्जी होने की जानकारी आपने दी है। एलर्जी संबंधी जानकारी अभी सत्यापित नहीं है।`;
    default: return `Món này có thể chứa ${allergens} bạn đã khai báo dị ứng. Thông tin dị ứng của món chưa được xác minh.`;
  }
}

function getReviewedConflictMessage(
  contains: readonly AllergenCode[],
  mayContain: readonly AllergenCode[],
  locale: MenuLocale
): string {
  const containsLabels = displayAllergens(contains, locale);
  const mayContainLabels = displayAllergens(mayContain, locale);
  switch (locale) {
    case 'en': {
      const statements = [contains.length ? `contains ${containsLabels}` : '', mayContain.length ? `may contain ${mayContainLabels}` : ''].filter(Boolean).join(' and ');
      return `This dish ${statements}, which you reported as an allergy.`;
    }
    case 'zh-CN': {
      const statements = [contains.length ? `含有${containsLabels}` : '', mayContain.length ? `可能含有${mayContainLabels}` : ''].filter(Boolean).join('，且');
      return `这道菜${statements}，与您申报的过敏原有关。`;
    }
    case 'ru': {
      const statements = [contains.length ? `содержит ${containsLabels}` : '', mayContain.length ? `может содержать ${mayContainLabels}` : ''].filter(Boolean).join('; также ');
      return `В этом блюде ${statements}, на которые вы указали аллергию.`;
    }
    case 'ko': {
      const statements = [contains.length ? `${containsLabels} 함유` : '', mayContain.length ? `${mayContainLabels} 포함 가능성` : ''].filter(Boolean).join(', ');
      return `이 메뉴에는 알레르기가 있다고 알려 주신 ${statements}이(가) 있습니다.`;
    }
    case 'hi-IN': {
      const statements = [contains.length ? `${containsLabels} शामिल हैं` : '', mayContain.length ? `${mayContainLabels} हो सकते हैं` : ''].filter(Boolean).join(' और ');
      return `इस व्यंजन में ${statements}, जिनसे आपको एलर्जी होने की जानकारी आपने दी है।`;
    }
    default: {
      const statements = [contains.length ? `có chứa ${containsLabels}` : '', mayContain.length ? `có thể chứa ${mayContainLabels}` : ''].filter(Boolean).join(' và ');
      return `Món này ${statements} bạn đã khai báo dị ứng.`;
    }
  }
}

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

function displayAllergens(codes: readonly AllergenCode[], locale: MenuLocale = 'vi'): string {
  return codes.map((code) => ALLERGEN_LABELS[code][locale]).join(', ');
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
  reportedAllergies: readonly string[],
  locale: MenuLocale = 'vi'
): MenuAllergenWarning {
  const reported = new Set(normalizeSupportedAllergens(reportedAllergies));
  const baseUnknownMessage = getUnknownAllergenMessage(locale);

  if (reported.size === 0) return { kind: 'NONE' };

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
      message: getUnverifiedConflictMessage(candidateConflicts, locale)
    };
  }

  const containsConflicts = declaration.contains.filter((code) => reported.has(code));
  const mayContainConflicts = declaration.mayContain.filter((code) => reported.has(code));
  if (containsConflicts.length === 0 && mayContainConflicts.length === 0) return { kind: 'NONE' };

  const source = containsConflicts.length > 0 && mayContainConflicts.length > 0
    ? 'MIXED'
    : containsConflicts.length > 0 ? 'CONTAINS' : 'MAY_CONTAIN';
  const codes = ALLERGEN_ORDER.filter((code) => containsConflicts.includes(code) || mayContainConflicts.includes(code));
  return {
    kind: 'CONFLICT',
    codes,
    source,
    informationIncomplete: false,
    message: getReviewedConflictMessage(containsConflicts, mayContainConflicts, locale)
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
