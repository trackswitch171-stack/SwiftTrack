const DEFAULT_TIMEZONE = 'America/New_York';

export function getAppTimezone(): string {
    if (typeof window === 'undefined') return DEFAULT_TIMEZONE;
    return window.localStorage.getItem('app.timezone') || DEFAULT_TIMEZONE;
}

export function setAppTimezone(timezone: string): void {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem('app.timezone', timezone);
}

function formatWithTimeZone(date: Date, options: Intl.DateTimeFormatOptions): string {
    return new Intl.DateTimeFormat('en-US', {
        timeZone: getAppTimezone(),
        ...options,
    }).format(date);
}

export function format(dateStr: string | Date | undefined): string {
    if (!dateStr) return 'N/A';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return formatWithTimeZone(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
        timeZoneName: 'short',
    });
}

export function formatDate(dateStr: string | Date | undefined): string {
    if (!dateStr) return 'N/A';
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    return formatWithTimeZone(date, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
}

export function timeAgo(dateStr: string | Date): string {
    const date = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    return formatDate(date);
}
