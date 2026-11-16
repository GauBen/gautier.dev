import { dailyOptions } from "./daily.js";
import { generate } from "./generator.js";

// Prerendered with the daily grid of the build day; the page fetches today's
// grid from a worker if the day has changed since.
export const load = () => {
  const date = Temporal.Now.plainDateISO();
  return { date: date.toString(), puzzle: generate(dailyOptions(date)) };
};
