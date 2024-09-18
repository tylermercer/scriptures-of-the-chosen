declare module 'verse-reference-regex' {
    interface Range {
      book: string | null;
      start: {
        chapter: number;
        verse: number | null;
        section: string | null;
      };
      end: {
        chapter: number;
        verse: number | null;
        section: string | null;
      };
    }
  
    interface CreateRegexOptions {
      requireVerse?: boolean;
      flags?: string;
      books?: string[];
    }
  
    function createRegex(options?: CreateRegexOptions): RegExp;
    
    function extractRangeFromMatch(match: RegExpExecArray | null, books?: string[]): Range;
  
    interface ChapterVerseRangeRegexOptions {
      requireVerse?: boolean;
      flags?: string;
    }
  
    function createChapterVerseRangeRegex(options?: ChapterVerseRangeRegexOptions): RegExp;
  
    export {
      createRegex,
      extractRangeFromMatch,
      createChapterVerseRangeRegex
    };
  }
  