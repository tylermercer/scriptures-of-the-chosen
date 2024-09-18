const formatter = new Intl.DateTimeFormat("en-US", {
    // weekday: 'short',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    timeZone: 'America/Denver'
});

export default function renderDate(date?: Date) {
    return date ? formatter.format(date) : "[Draft]";
}