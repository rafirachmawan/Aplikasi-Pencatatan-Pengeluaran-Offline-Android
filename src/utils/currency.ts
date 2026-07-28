// ─────────────────────────────────────────────
//  Currency Utilities
// ─────────────────────────────────────────────

/**
 * Format angka ke format Rupiah: Rp 1.500.000
 */
export const formatRupiah = (amount: number): string => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

/**
 * Format compact: Rp 1,5jt / Rp 500rb
 */
export const formatRupiahCompact = (amount: number): string => {
  if (amount >= 1_000_000) {
    return `Rp ${(amount / 1_000_000).toFixed(1)}jt`;
  }
  if (amount >= 1_000) {
    return `Rp ${(amount / 1_000).toFixed(0)}rb`;
  }
  return formatRupiah(amount);
};

/**
 * Parse string angka dari input user (hapus non-digit)
 */
export const parseAmount = (raw: string): number => {
  const digits = raw.replace(/\D/g, '');
  return parseInt(digits || '0', 10);
};

/**
 * Format input nominal saat user mengetik: "1500000" → "1.500.000"
 */
export const formatInputAmount = (raw: string): string => {
  const digits = raw.replace(/\D/g, '');
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

/**
 * Konversi ke sen (integer) untuk menghindari floating-point issue JS
 */
export const toSen = (amount: number): number => Math.round(amount * 100);
export const fromSen = (sen: number): number => sen / 100;
