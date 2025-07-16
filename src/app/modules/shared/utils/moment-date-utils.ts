import moment from 'moment';

/**
 * Date utilities using Moment.js to handle timezone offset issues
 * 
 * Moment.js provides better date handling and avoids timezone conversion problems
 * when working with date-only strings.
 */

/**
 * Creates a Date object from a date string using Moment.js without timezone issues
 * @param dateString Date string in format YYYY-MM-DD
 * @returns Date object or null
 */
export function momentCreateDate(dateString: string | null | undefined): Date | null {
  if (!dateString) return null;
  
  const momentDate = moment(dateString, 'YYYY-MM-DD', true); // strict parsing
  return momentDate.isValid() ? momentDate.toDate() : null;
}

/**
 * Formats a Date object to YYYY-MM-DD string using Moment.js
 * @param date Date object to format
 * @returns Date string in YYYY-MM-DD format or undefined
 */
export function momentFormatDate(date: Date | null | undefined): string | undefined {
  if (!date) return undefined;
  
  return moment(date).format('YYYY-MM-DD');
}

/**
 * Safely creates a Date object from various input types using Moment.js
 * @param dateInput Date string, Date object, or null/undefined
 * @returns Date object or null
 */
export function momentSafeCreateDate(dateInput: string | Date | null | undefined): Date | null {
  if (!dateInput) return null;
  
  if (dateInput instanceof Date) {
    return dateInput;
  }
  
  // Try to parse with Moment.js
  const momentDate = moment(dateInput);
  return momentDate.isValid() ? momentDate.toDate() : null;
}

/**
 * Gets today's date using Moment.js
 * @returns Today's date at start of day
 */
export function momentGetToday(): Date {
  return moment().startOf('day').toDate();
}

/**
 * Compares two dates using Moment.js, ignoring time
 * @param date1 First date
 * @param date2 Second date
 * @returns true if both dates represent the same day
 */
export function momentIsSameDay(date1: Date | null, date2: Date | null): boolean {
  if (!date1 || !date2) return false;
  
  return moment(date1).isSame(moment(date2), 'day');
}

/**
 * Adds days to a date using Moment.js
 * @param date Base date
 * @param days Number of days to add (can be negative)
 * @returns New date with added days
 */
export function momentAddDays(date: Date | null, days: number): Date | null {
  if (!date) return null;
  
  return moment(date).add(days, 'days').toDate();
}

/**
 * Gets the difference in days between two dates
 * @param date1 First date
 * @param date2 Second date
 * @returns Number of days difference
 */
export function momentDiffDays(date1: Date | null, date2: Date | null): number {
  if (!date1 || !date2) return 0;
  
  return moment(date1).diff(moment(date2), 'days');
}
