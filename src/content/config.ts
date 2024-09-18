import { z, defineCollection } from "astro:content";
import episodesLoader from "src/loaders/episodes";

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
  loader: episodesLoader,
});

export const collections = {
  episodes,
  seasons,
};