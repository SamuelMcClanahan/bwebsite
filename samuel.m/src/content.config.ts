import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const work = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    tags: z.array(z.string()),
    category: z.enum(['writeup', 'project']),
    excerpt: z.string(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    name: z.string(),
    tag: z.string(),
    status: z.enum(['active', 'shipped', 'v1', 'v2']),
    year: z.string(),
    summary: z.string(),
  }),
});

export const collections = { work, projects };
