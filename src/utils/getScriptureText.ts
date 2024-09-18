import {
	createRegex,
	extractRangeFromMatch,
} from 'verse-reference-regex'

export interface Verse {
    number: number,
    text: string,
}

const regex = createRegex();

const getChapterRange = (start: number, end: number) => 
    (new Array(end - start + 1))
        .fill(0)
        .map(i => i + start);

const fetchVerses = async (data: ReturnType<typeof extractRangeFromMatch>): Promise<Verse[]> => {
    return (await Promise.all(getChapterRange(data.start.chapter, data.end.chapter).map(async (chapter: number): Promise<Verse[]> => {
        const response = await fetch(`https://bible.helloao.org/api/eng_kjv/${data.book}/${chapter}.json`)
            .then(r => r.json());

        const verses = response
            .chapter
            .content
            .filter((c: any) => c.type === 'verse')
            .map((v: any) => ({
                number: v.number,
                text: v.content
                    .filter((text: any) => typeof text === 'string' || typeof text.text === 'string')
                    .map((text: { text: string } | string) => typeof text === 'string' ? text : text.text)
                    .join(' ')
            })) as Verse[];

        return verses.slice(
            chapter === data.start.chapter && data.start.verse != null ? data.start.verse - 1 : 0,
            chapter === data.end.chapter && data.end.verse != null ? data.end.verse : verses.length,
        );
    }))).flat();
};

/**
 * 
 * @param passage The reference to retrieve, in [Full Book Name] [Chapter]:[Verse | Verse-Range]
 */
export default async function getScriptureText(passage: string): Promise<Verse[]> {
    const range = extractRangeFromMatch(regex.exec(passage))

    const verses = await fetchVerses(range);
    
    return verses;
}