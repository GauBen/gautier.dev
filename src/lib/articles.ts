import type { SvelteComponent } from "svelte";

export type Article = {
  metadata: {
    title: string;
    description?: string;
    snippet?: { code: string; lang: string };
  };
  banner?: string;
  default: new (...args: unknown[]) => SvelteComponent;
};

export const articles = new Map(
  Object.entries(import.meta.glob<Article>("../articles/*/index.md")).map(
    ([file, load]) => {
      const match = file.match(
        /^..\/articles\/(?<date>\d\d\d\d-\d\d-\d\d|draft)-(?<slug>.+)\/index.md$/,
      );
      if (!match?.groups) throw new Error(`Invalid article file name: ${file}`);
      const { date, slug } = match.groups;
      return [
        slug,
        {
          date: date === "draft" ? null : new Date(date),
          load,
          raw: () =>
            import(`../articles/${date}-${slug}/index.md?raw`).then(
              (m) => m.default,
            ),
        },
      ];
    },
  ),
);

export const formatDate = (date: Date) =>
  Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
  }).format(date);
