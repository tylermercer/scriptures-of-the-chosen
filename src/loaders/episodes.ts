import getScriptureText from "@utils/getScriptureText";
import type { LoaderContext } from "astro/loaders";
import { reference, z } from "astro:content";

export default {
    name: 'episodes-loader',
    load: async (context: LoaderContext) => {
        const references = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=References`)
            .then(r => r.json())
            .then(r => r.filter((e: any) => e.episode && e.season))
            .then(async (array: any) => Promise.all(array.map(async (ref: any) => ({
                ...ref,
                passage: ref.verses,
                verses: await getScriptureText(ref.verses),
            }))));

        const episodesResponse = await fetch(`${import.meta.env.GOOGLE_SHEET_APP_URL}?s=Episodes`);
        const episodes = (await episodesResponse.json()).filter((e: any) => e.season && e.episode).sort((e: any) => e.season + e.episode);

        const data = episodes.map((e: any) => ({
            id: `${e.season}:${e.episode}`,
            season: e.season,
            episode: e.episode,
            title: e.title,
            description: e.description,
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
      references: z.array(z.object({
        timeRange: z.string().optional(),
        notes: z.string(),
        passage: z.string(),
        type: z.string(),
        verses: z.array(z.object({
            number: z.number(),
            text: z.string(),
        })),
      }))
    }),
}