export default function pluralize(str: string, count: number) {
    return count === 1 ? str : `${str}s`;
}