// ─────────────────────────────────────────────
//  Date Utilities (dayjs)
// ─────────────────────────────────────────────
import dayjs from 'dayjs';
import 'dayjs/locale/id';
import localizedFormat from 'dayjs/plugin/localizedFormat';
import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';

dayjs.extend(localizedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.locale('id');

export const today = (): string => dayjs().format('YYYY-MM-DD');

export const formatDate = (isoDate: string): string =>
  dayjs(isoDate).format('DD MMM YYYY');

export const formatDateLong = (isoDate: string): string =>
  dayjs(isoDate).format('dddd, DD MMMM YYYY');

export const formatDateShort = (isoDate: string): string =>
  dayjs(isoDate).format('DD/MM');

export const formatMonthYear = (isoDate: string): string =>
  dayjs(isoDate).format('MMMM YYYY');

export const getStartOfMonth = (date?: string): string =>
  dayjs(date).startOf('month').format('YYYY-MM-DD');

export const getEndOfMonth = (date?: string): string =>
  dayjs(date).endOf('month').format('YYYY-MM-DD');

export const currentMonthLabel = (): string =>
  dayjs().format('MMMM YYYY');

export const isSameDay = (a: string, b: string): boolean =>
  dayjs(a).isSame(dayjs(b), 'day');

export const isToday = (date: string): boolean =>
  isSameDay(date, today());

export const isYesterday = (date: string): boolean =>
  isSameDay(date, dayjs().subtract(1, 'day').format('YYYY-MM-DD'));

/**
 * Label relatif untuk header section riwayat
 */
export const relativeDateLabel = (date: string): string => {
  if (isToday(date)) return 'Hari Ini';
  if (isYesterday(date)) return 'Kemarin';
  return formatDateLong(date);
};

export const dayjsInstance = dayjs;
