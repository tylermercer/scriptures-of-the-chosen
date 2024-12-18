import { z, defineCollection, reference } from "astro:content";

if (!import.meta.env.GOOGLE_SHEET_APP_URL.startsWith('https')) {
  throw new Error("GOOGLE_SHEET_APP_URL not set at build time")
}

const seasons = defineCollection({
  type: 'content_layer',
  loader: async () => {
    const response = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=Seasons`);
    const data = await response.json();

    return data.map((season: any) => ({
      id: season.season,
      ...season,
      season: undefined,
      title: `Season ${season.season.substring(1)}`,
    }));
  },
  schema: z.object({
    title: z.string(),
  }),
})

const episodes = defineCollection({
  type: 'content_layer',
  loader: async () => {
    const references = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=References`)
      .then(r => r.json())
      .then(r => r.filter((e: any) => e.episode && e.season));

    const episodes = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=Episodes`)
      .then(r => r.json())
      .then(r => r
        .filter((e: any) => e.season && e.episode)
        .sort((e: any) => e.season + e.episode)
      );

    return episodes.map((e: any) => ({
      id: `${e.season}:${e.episode}`,
      ...e,
      references: references.filter((r: any) => r.season === e.season && r.episode === e.episode)
    }));
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    season: reference('seasons'),
    episode: z.string(),
    watchUrl: z.string().url(),
    references: z.array(z.object({
      timeRange: z.string().optional(),
      notes: z.string(),
      passage: z.string(),
      type: z.string(),
    }))
  }),
});

export const collections = {
  episodes,
  seasons,
};