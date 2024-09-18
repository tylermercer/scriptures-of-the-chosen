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
    const response = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=References`);
    const data = await response.json();

    const groupedData = data.filter((e: any) => e.season && e.episode).reduce((acc: any, item: any) => {
      const episodeId = `${item.season}:${item.episode}`;

      if (!acc[episodeId]) {
        acc[episodeId] = {
          id: episodeId,
          season: item.season,
          episode: item.episode,
          title: 'TODO: get from other API call',
          description: 'TODO: get from other API call',
          references: []
        };
      }

      acc[episodeId].references.push(item);

      return acc;
    }, {});

    return Object.values(groupedData) as { id: string }[];
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