export type MenuAttributeGroupKey = 'nutrition' | 'diet' | 'context' | 'other';

export interface MenuAttributeMeta {
  key: string;
  label: string;
  description: string;
  group: MenuAttributeGroupKey;
  barClassName: string;
}

export interface MenuAttributeEntry extends MenuAttributeMeta {
  count: number;
}

export interface MenuAttributeGroup {
  key: MenuAttributeGroupKey;
  label: string;
  description: string;
  attributes: MenuAttributeEntry[];
}

export const MENU_ATTRIBUTE_GROUPS: ReadonlyArray<Pick<MenuAttributeGroup, 'key' | 'label' | 'description'>> = [
  {
    key: 'nutrition',
    label: 'Dinh dưỡng',
    description: 'Chỉ số thành phần và năng lượng của món.',
  },
  {
    key: 'diet',
    label: 'Chế độ ăn',
    description: 'Món phù hợp với nhu cầu ăn kiêng hoặc loại trừ thành phần.',
  },
  {
    key: 'context',
    label: 'Ngữ cảnh sử dụng',
    description: 'Món phù hợp với thời điểm, mục đích hoặc cách dùng.',
  },
  {
    key: 'other',
    label: 'Khác',
    description: 'Thuộc tính mới chưa có trong danh mục hiển thị.',
  },
];

const attributeDefinitions: Record<string, Omit<MenuAttributeMeta, 'key'>> = {
  HIGH_PROTEIN: {
    label: 'Giàu đạm',
    description: 'Từ 25g protein trong một món.',
    group: 'nutrition',
    barClassName: 'bg-emerald-500',
  },
  VERY_HIGH_PROTEIN: {
    label: 'Rất giàu đạm',
    description: 'Từ 40g protein trong một món.',
    group: 'nutrition',
    barClassName: 'bg-emerald-600',
  },
  ENERGY_DENSE: {
    label: 'Năng lượng cao',
    description: 'Từ 600 kcal trong một món.',
    group: 'nutrition',
    barClassName: 'bg-amber-500',
  },
  HEAVY_MEAL: {
    label: 'Món no',
    description: 'Từ 700 kcal hoặc 25g chất béo trong một món.',
    group: 'nutrition',
    barClassName: 'bg-orange-500',
  },
  LIGHT_MEAL: {
    label: 'Ăn nhẹ',
    description: 'Tối đa 400 kcal và 15g chất béo trong một món.',
    group: 'nutrition',
    barClassName: 'bg-teal-500',
  },
  LOW_SUGAR: {
    label: 'Ít đường',
    description: 'Tối đa 5g đường trong một món.',
    group: 'nutrition',
    barClassName: 'bg-sky-500',
  },
  LOW_CALORIE: {
    label: 'Ít calo',
    description: 'Tối đa 400 kcal trong một món.',
    group: 'nutrition',
    barClassName: 'bg-green-500',
  },
  HIGH_FIBER: {
    label: 'Nhiều chất xơ',
    description: 'Từ 6g chất xơ trong một món.',
    group: 'nutrition',
    barClassName: 'bg-lime-500',
  },
  LOW_FAT: {
    label: 'Ít béo',
    description: 'Tối đa 10g chất béo trong một món.',
    group: 'nutrition',
    barClassName: 'bg-cyan-500',
  },
  HIGH_CARB: {
    label: 'Nhiều tinh bột',
    description: 'Từ 80g carb trong một món.',
    group: 'nutrition',
    barClassName: 'bg-yellow-500',
  },
  KETO_FRIENDLY: {
    label: 'Phù hợp Keto',
    description: 'Tối đa 20g carb và phần lớn năng lượng đến từ chất béo.',
    group: 'nutrition',
    barClassName: 'bg-violet-500',
  },
  POST_WORKOUT: {
    label: 'Sau tập luyện',
    description: 'Từ 25g protein và 30–60g carb trong một món.',
    group: 'nutrition',
    barClassName: 'bg-indigo-500',
  },
  VEGETARIAN: {
    label: 'Món chay',
    description: 'Không có thịt, cá hoặc hải sản theo dữ liệu thành phần.',
    group: 'diet',
    barClassName: 'bg-green-600',
  },
  VEGAN: {
    label: 'Thuần chay',
    description: 'Không có thành phần động vật theo dữ liệu thành phần.',
    group: 'diet',
    barClassName: 'bg-emerald-600',
  },
  GLUTEN_FREE: {
    label: 'Không gluten',
    description: 'Không có thành phần chứa gluten theo dữ liệu thành phần.',
    group: 'diet',
    barClassName: 'bg-amber-500',
  },
  DAIRY_FREE: {
    label: 'Không bơ sữa',
    description: 'Không có sữa hoặc chế phẩm từ sữa theo dữ liệu thành phần.',
    group: 'diet',
    barClassName: 'bg-pink-500',
  },
  OFFICE_LUNCH: {
    label: 'Trưa văn phòng',
    description: 'Khoảng 400–700 kcal và không thuộc nhóm món no.',
    group: 'context',
    barClassName: 'bg-slate-500',
  },
  QUICK_BITE: {
    label: 'Ăn nhanh',
    description: 'Tối đa 350 kcal và phù hợp một khẩu phần.',
    group: 'context',
    barClassName: 'bg-purple-500',
  },
  SOCIAL_SHARING: {
    label: 'Dùng để chia sẻ',
    description: 'Phù hợp từ 2 khẩu phần.',
    group: 'context',
    barClassName: 'bg-fuchsia-500',
  },
  FAMILY_MEAL: {
    label: 'Bữa gia đình',
    description: 'Phù hợp từ 4 khẩu phần.',
    group: 'context',
    barClassName: 'bg-rose-500',
  },
  LATE_NIGHT_FIT: {
    label: 'Ăn đêm cân bằng',
    description: '300–600 kcal với chất béo và carb ở mức vừa phải.',
    group: 'context',
    barClassName: 'bg-indigo-500',
  },
  COMFORT_FOOD: {
    label: 'Món ăn quen thuộc',
    description: 'Có từ 20g chất béo và 50g carb trong một món.',
    group: 'context',
    barClassName: 'bg-rose-600',
  },
  REFRESHING: {
    label: 'Thanh mát',
    description: 'Tối đa 300 kcal và có nguyên liệu rau củ.',
    group: 'context',
    barClassName: 'bg-cyan-600',
  },
};

function formatFallbackLabel(attribute: string): string {
  const words = attribute
    .split('_')
    .filter(Boolean)
    .map((word) => word.toLowerCase());

  if (words.length === 0) return 'Thuộc tính chưa đặt tên';

  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(' ');
}

export function getMenuAttributeMeta(attribute: string): MenuAttributeMeta {
  const definition = attributeDefinitions[attribute];

  if (definition) {
    return { key: attribute, ...definition };
  }

  return {
    key: attribute,
    label: formatFallbackLabel(attribute),
    description: 'Thuộc tính bổ sung của món ăn.',
    group: 'other',
    barClassName: 'bg-neutral-500',
  };
}

export function groupMenuAttributes(attributeDistribution: Record<string, number>): MenuAttributeGroup[] {
  const grouped = new Map<MenuAttributeGroupKey, MenuAttributeEntry[]>(
    MENU_ATTRIBUTE_GROUPS.map((group) => [group.key, []])
  );

  for (const [key, count] of Object.entries(attributeDistribution)) {
    if (!Number.isFinite(count) || count <= 0) continue;

    const meta = getMenuAttributeMeta(key);
    grouped.get(meta.group)?.push({ ...meta, count });
  }

  return MENU_ATTRIBUTE_GROUPS.map((group) => ({
    ...group,
    attributes: (grouped.get(group.key) ?? []).sort((left, right) => (
      right.count - left.count || left.label.localeCompare(right.label, 'vi')
    )),
  }));
}
