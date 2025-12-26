import type { Component } from "svelte";

export type Article = {
  metadata: {
    title: string;
    description?: string;
    snippet?: { code: string; lang: string };
  };
  banner?: string;
  default: Component;
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
        },
      ];
    },
  ),
);

export const formatDate = (date: Date) =>
  Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
