import type { LoaderContext } from "astro/loaders";
import { reference, z } from "astro:content";

export default {
    name: 'episodes-loader',
    load: async (context: LoaderContext) => {
        const references = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=References`)
            .then(r => r.json())
            .then(r => r.filter((e: any) => e.episode && e.season));

        const episodesResponse = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=Episodes`);
        const episodes = (await episodesResponse.json()).filter((e: any) => e.season && e.episode).sort((e: any) => e.season + e.episode);

        const data = episodes.map((e: any) => ({
            id: `${e.season}:${e.episode}`,
            ...e,
            references: references.filter((r: any) => r.season === e.season && r.episode === e.episode)
        }))

        for (const item of data) {
            const parsed = await context.parseData({
              id: item.id,
              data: item,
            });
            context.store.set({
              id: item.id,
              data: parsed,
            });
          }
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
}