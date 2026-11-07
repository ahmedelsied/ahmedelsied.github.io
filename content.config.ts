import { defineCollection, defineContentConfig, z } from '@nuxt/content';

const writesSchema = z.object({
  title: z.string(),
  title_ar: z.string().optional(),
  description: z.string().optional(),
  description_ar: z.string().optional(),
  date: z.string(),
  updatedAt: z.string().optional(),
  draft: z.boolean().optional(),
  lang: z.string().optional(),
  keywords: z.array(z.string()).optional(),
  image: z.string().optional(),
  readingMinutes: z.number().optional(),
});

export default defineContentConfig({
  collections: {
    writes: defineCollection({
      type: 'page',
      source: 'writes/*.md',
      schema: writesSchema,
    }),
    writesAr: defineCollection({
      type: 'page',
      source: 'writes-ar/*.md',
      schema: writesSchema,
    }),
  },
});
