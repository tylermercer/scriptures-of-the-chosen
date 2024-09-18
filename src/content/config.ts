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
    const referencesResponse = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=References`);
    const references = await referencesResponse.json();

    const episodesResponse = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=Episodes`);
    const episodes = (await episodesResponse.json()).sort((e: any) => e.season + e.episode);

    return episodes.map((e: any) => ({
      id: `${e.season}:${e.episode}`,
      season: e.season,
      episode: e.episode,
      title: e.title,
      description: e.description,
      references: references.filter((r: any) => r.season === e.season && r.episode === e.episode)
    }))
  },
  schema: z.object({
    title: z.string(),
    description: z.string(),
    season: reference('seasons'),
    episode: z.string(),
    references: z.array(z.object({
      timeRange: z.string(),
      notes: z.string(),
      verses: z.string(),
      type: z.string(),
    }))
  }),
});

export const collections = {
  episodes,
  seasons,
};