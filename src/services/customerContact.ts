export interface CustomerContactInput {
  customerName?: string;
  customerPhone?: string;
  marketingConsent?: boolean;
}

export interface CustomerContactPayload {
  customerName?: string;
  customerPhone?: string;
  marketingConsent?: boolean;
  consentVersion?: string;
}

const VIETNAMESE_MOBILE = /^(3[2-9]|5[25689]|7[06-9]|8[1-689]|9[0-46-9])\d{7}$/;

export function normalizeOptionalVietnamesePhone(value?: string): string | undefined {
  if (!value?.trim()) return undefined;
  const compact = value.replace(/[\s().-]/g, '');
  const digits = compact.startsWith('+') ? compact.slice(1) : compact;
  const nationalNumber = digits.startsWith('84')
    ? digits.slice(2)
    : digits.startsWith('0')
      ? digits.slice(1)
      : digits;

  if (!/^\d+$/.test(digits) || !VIETNAMESE_MOBILE.test(nationalNumber)) {
    throw new Error('Số điện thoại không hợp lệ');
  }
  return `+84${nationalNumber}`;
}

export function isOptionalVietnamesePhoneValid(value?: string): boolean {
  try {
    normalizeOptionalVietnamesePhone(value);
    return true;
  } catch {
    return false;
  }
}

export function buildCustomerContactPayload(input: CustomerContactInput): CustomerContactPayload {
  const customerName = input.customerName?.trim() || undefined;
  const customerPhone = normalizeOptionalVietnamesePhone(input.customerPhone);

  if (!customerPhone) return { customerName };

  return {
    customerName,
    customerPhone,
    marketingConsent: input.marketingConsent === true,
    consentVersion: 'crm-v1'
  };
}
