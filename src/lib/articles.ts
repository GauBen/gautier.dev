import type { SvelteComponent } from "svelte";

export type Article = {
  metadata: {
    title: string;
    draft?: boolean;
    description?: string;
    snippet?: { code: string; lang: string };
  };
  banner?: string;
  default: new (...args: unknown[]) => SvelteComponent;
};

export const articles = new Map(
  Object.entries(import.meta.glob<Article>("../articles/*/index.md")).map(
    ([path, load]) => {
      const match = path.match(
        /^..\/articles\/(?<date>\d\d\d\d-\d\d-\d\d)-(?<slug>.+)\/index.md$/,
      );
      if (!match?.groups) throw new Error(`Invalid article path: ${path}`);
      return [match.groups.slug, { date: new Date(match.groups.date), load }];
    },
  ),
);

export const formatDate = (date: Date) =>
  Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
