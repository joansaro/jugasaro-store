/**
 * Format money cents (integer) into a localized string.
 * The API stores all money as integer cents.
 */
export const formatPrice = (
  cents: number,
  opts: { currency?: string; locale?: string } = {},
): string => {
  const currency = opts.currency ?? 'USD';
  const locale = opts.locale ?? 'en-US';
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(cents / 100);
};
