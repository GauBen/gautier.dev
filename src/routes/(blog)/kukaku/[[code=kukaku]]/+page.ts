import { resolve } from "$app/paths";
import { error, redirect } from "@sveltejs/kit";
import { generatePuzzle } from "../client.svelte.js";
import { parseCode } from "../code.js";

// Grids are generated in the browser, in a worker: the server only serves the
// page (whatever the code in the URL), so that requests cost it nothing
export const ssr = false;
export const prerender = false;

export const load = async ({ params }) => {
  // Today in the timezone of the visitor
  const today = Temporal.Now.plainDateISO();
  if (!params.code)
    redirect(
      307,
      resolve("/(blog)/kukaku/[[code=kukaku]]", { code: String(today) }),
    );

  const parsed = parseCode(params.code);
  if (!parsed) error(404, "Not found");
  const { date, options } = parsed;
  // Tomorrow's grid is already out in timezones ahead
  if (date && Temporal.PlainDate.compare(date, today.add({ days: 1 })) > 0)
    error(404, "This grid is not out yet");
  return { date, options, today, puzzle: await generatePuzzle(options) };
};
