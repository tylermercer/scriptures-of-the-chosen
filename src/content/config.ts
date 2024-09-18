import { z, defineCollection, reference } from "astro:content";

const seasons = defineCollection({
  type: 'data',
  schema: z.object({
    title: z.string(),
  }),
})

const episodes = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    season: reference('seasons'),
  }),
});

export const collections = {
  episodes,
  seasons,
};