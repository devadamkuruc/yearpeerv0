// utils/date.ts
import { format, parseISO } from 'date-fns';

export const DATE_FORMAT = 'yyyy-MM-dd';
export const DATETIME_FORMAT = "yyyy-MM-dd'T'HH:mm:ss.SSS'Z'";

export function formatDate(date: Date): string {
    return format(date, DATE_FORMAT);
}

export function formatDateTime(date: Date): string {
    return format(date, DATETIME_FORMAT);
}

export function parseDate(dateStr: string): Date {
    return parseISO(dateStr);
}