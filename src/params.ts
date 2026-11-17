import { defineParams } from "@sveltejs/kit/params";

export const params = defineParams({
  /**
   * Code of a Kukaku grid: a date, or `<size><group size><difficulty><seed>`
   * (see `parseCode`). Self-contained, as Node loads this file at build time.
   */
  kukaku: (code) =>
    /^(\d{4}-\d{2}-\d{2}|[5-8](2e|[3-6][emh])\d{1,10})$/.test(code)
      ? code
      : undefined,
});
