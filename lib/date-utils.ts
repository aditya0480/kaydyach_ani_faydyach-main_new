import { startOfDay, startOfMonth, endOfMonth, subMonths, subDays } from "date-fns";

// IST is UTC + 5:30
const IST_OFFSET_MS = 5.5 * 60 * 60 * 1000;

/**
 * Converts a UTC date object to a new Date object representing IST time.
 * (Technically it shifts the time value so that getOthers methods return IST values)
 */
export const toIST = (date: Date): Date => {
    return new Date(date.getTime() + IST_OFFSET_MS);
};

/**
 * Converts an IST shifted date object back to UTC real time.
 * Used for creating database query timestamps.
 */
export const fromIST = (date: Date): Date => {
    return new Date(date.getTime() - IST_OFFSET_MS);
};

/**
 * Returns the current date/time in IST.
 */
export const getNowIST = (): Date => {
    return toIST(new Date());
};

/**
 * Returns the start of the current day in IST, converted back to UTC for DB queries.
 * @param date Optional date to start from (defaults to NOW in IST)
 */
export const getStartOfDayIST = (date?: Date): Date => {
    const targetDate = date ? toIST(date) : getNowIST();
    const startIST = startOfDay(targetDate);
    return fromIST(startIST);
};

/**
 * Returns a date range object { gte, lte } for Prisma queries based on IST periods.
 */
export const getISTDateRange = (filter: 'today' | 'week' | 'month' | '2months' | '3months' | 'all') => {
    const nowIST = getNowIST();

    if (filter === 'all') return undefined;

    let startIST: Date;
    const endIST: Date | undefined = undefined;

    switch (filter) {
        case 'week':
            startIST = subDays(nowIST, 7);
            break;
        case 'month':
            startIST = startOfMonth(nowIST);
            break;
        case '2months':
            startIST = subDays(nowIST, 60);
            break;
        case '3months':
            startIST = subDays(nowIST, 90);
            break;
        case 'today':
        default:
            startIST = startOfDay(nowIST);
            break;
    }

    return {
        gte: fromIST(startIST),
        lte: endIST ? fromIST(endIST) : undefined
    };
};

/**
 * Helper to get specific stats periods in IST (for dashboard cards)
 */
export const getDashboardPeriods = () => {
    const nowIST = getNowIST();

    return {
        todayStart: fromIST(startOfDay(nowIST)),
        currentMonthStart: fromIST(startOfMonth(nowIST)),
        previousMonthStart: fromIST(startOfMonth(subMonths(nowIST, 1))),
        previousMonthEnd: fromIST(endOfMonth(subMonths(nowIST, 1))),
    };
};
