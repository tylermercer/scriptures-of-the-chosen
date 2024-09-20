import {
    createRegex,
    extractRangeFromMatch,
} from 'verse-reference-regex'

const regex = createRegex();

export default function standardizeScripture(passage: string): string {
    const range = extractRangeFromMatch(regex.exec(passage))

    const v = (verse: number | null) => verse ? `:${verse}` : '';

    const rangeText =
        range.start.chapter !== range.end.chapter && range.end.chapter !== null ? `${range.start.chapter}${v(range.start.verse)}-${range.end.chapter}${v(range.end.verse)}` :
            range.start.verse !== range.end.verse && range.end.verse !== null ? `${range.start.chapter}${v(range.start.verse)}-${range.end.verse}` :
                `${range.start.chapter}${v(range.start.verse)}`;

    return `${range.book} ${rangeText}`;
}