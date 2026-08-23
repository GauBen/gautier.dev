import { articles } from "#lib/articles.js";

export const entries = () => [...articles.keys()].map((slug) => ({ slug }));
