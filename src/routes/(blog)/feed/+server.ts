import { load } from "../+page.server.js";

const computeIndent = (string: string) => {
  const lines = string.split("\n").slice(1);
  if (lines.length === 0) return 0;
  return Math.min(...lines.map((line) => line.match(/^\s*/)?.[0].length ?? 0));
};

const rodent = (strings: TemplateStringsArray, ...values: unknown[]) => {
  const globalIndent = computeIndent(strings.join(""));
  const lines = strings[0].split("\n");
  let output = lines[0];
  for (const line of lines.slice(1)) output += "\n" + line.slice(globalIndent);
  let lastLineIndent = lines[lines.length - 1].match(/\s*/)?.[0] ?? "";

  for (const [i, string] of strings.slice(1).entries()) {
    let value: string[];
    if (Array.isArray(values[i])) value = (values[i] as unknown[]).map(String);
    else value = [String(values[i])];

    for (const [i, item] of value.entries()) {
      const indent = computeIndent(item);
      const prefix = lastLineIndent.slice(globalIndent);
      const lines = item.split("\n");
      output += lines[0];
      for (const line of lines.slice(1))
        output += "\n" + prefix + line.slice(indent);
      if (i !== value.length - 1) output += "\n" + prefix;
    }

    const lines = string.split("\n");
    output += lines[0];
    for (const line of lines.slice(1))
      output += "\n" + line.slice(globalIndent);
    lastLineIndent = lines[lines.length - 1].match(/\s*/)?.[0] ?? "";
  }

  return output;
};

export const GET = async () => {
  const { articles } = await load();
  return new Response(
    rodent /* HTML */ `<?xml version="1.0" encoding="utf-8"?>
      <feed xmlns="http://www.w3.org/2005/Atom">
        <title>gautier.dev articles</title>
        <link href="https://gautier.dev/" />
        <link rel="self" href="https://gautier.dev/feed" />
        <updated>${articles[0].date?.toISOString()}</updated>
        <author>
          <name>Gautier Ben Aïm</name>
        </author>
        <id>https://gautier.dev/</id>
        ${articles.map(({ slug, title, date, description }) =>
          date
            ? /* HTML */ `<entry>
                <title>${title}</title>
                <link href="https://gautier.dev/articles/${slug}" />
                <id>https://gautier.dev/articles/${slug}</id>
                <updated>${date.toISOString()}</updated>
                <summary>${description}</summary>
              </entry>`
            : "",
        )}
      </feed>`,
    {
      headers: {
        "Content-Type": "application/atom+xml",
      },
    },
  );
};
