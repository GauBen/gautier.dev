/** @jsxImportSource xastscript */
import { resolve } from "$app/paths";
import type { RequestEvent } from "./$types.js";
import { load } from "../+page.server.js";
import { toXml } from "xast-util-to-xml";

export const GET = async ({ url }: RequestEvent) => {
  const { articles } = await load();
  return new Response(
    `<?xml version="1.0" encoding="utf-8"?>${toXml(
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>gautier.dev articles</title>
        <link href={new URL(resolve("/(blog)"), url).href} />
        <link rel="self" href={new URL(resolve("/(blog)/feed"), url).href} />
        <updated>{articles[0].date?.toString()}T12:00:00Z</updated>
        <author>
          <name>Gautier Ben Aïm</name>
        </author>
        <id>{new URL(resolve("/(blog)"), url).href}</id>
        <>
          {articles.map(({ slug, title, date, description }) => (
            <entry>
              <title>{title}</title>
              <link
                href={
                  new URL(resolve("/(blog)/articles/[slug]", { slug }), url)
                    .href
                }
              />
              <id>
                {
                  new URL(resolve("/(blog)/articles/[slug]", { slug }), url)
                    .href
                }
              </id>
              <updated>{date?.toString()}T12:00:00Z</updated>
              <summary>{description}</summary>
            </entry>
          ))}
        </>
      </feed>,
    )}`,
    { headers: { "Content-Type": "application/atom+xml" } },
  );
};
