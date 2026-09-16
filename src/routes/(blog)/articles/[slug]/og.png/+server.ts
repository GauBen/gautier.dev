import { articles } from "#lib/articles.js";
import { read } from "$app/server";
import { error, redirect } from "@sveltejs/kit";
import type { TokenStream } from "prismjs";
import { jsx } from "satori/jsx/jsx-runtime";
import favicon from "/static/favicon.svg";
import { formatDate } from "../../../date.js";
import zxproto from "./0xProto-Regular.otf";
import technasans from "./TechnaSans-Regular.otf";
import inter200 from "./inter-latin-200-normal.woff";
import inter400 from "./inter-latin-400-normal.woff";

export const prerender = true;
export const entries = () => [...articles.keys()].map((slug) => ({ slug }));

interface Node {
  str: string;
  color?: string;
}
export const GET = async ({ params }) => {
  if (process.env.NODE_ADAPTER_SEA_BUILD)
    return error(418, "Not available on this server");

  const article = articles.get(params.slug);
  if (!article) return error(404, "Article not found");
  const { date, load } = article;
  const { banner, frontmatter } = await load();
  if (banner) return redirect(307, banner.img.src);

  const { default: satori } = await import("satori");
  const { default: sharp } = await import("sharp");
  const { tokenize } = await import("#lib/prism.js");

  const colors = {
    "#0077bf": ["attr-name", "function", "property"],
    "#5c33bd": ["keyword", "atrule"],
    "#ab6000": ["builtin", "class-name", "constant", "selector", "tag"],
    "#bd2a33": ["boolean", "entity", "number", "symbol"],
    "#4e7e06": ["attr-value", "char", "important", "regex", "string"],
    "#355454": [
      "cdata",
      "comment",
      "doc",
      "doctype",
      "namespace",
      "operator",
      "prolog",
      "punctuation",
      "url",
    ],
  };
  const map = new Map(
    Object.entries(colors).flatMap(([color, types]) =>
      types.map((type) => [type, color]),
    ),
  );
  const getColor = ({
    type,
    alias,
  }: {
    type: string;
    alias?: string | string[];
  }) => {
    const candidates = [type];
    if (typeof alias === "string") candidates.push(alias);
    if (Array.isArray(alias)) candidates.push(...alias);
    return candidates.map((type) => map.get(type)).find(Boolean);
  };

  const lines = frontmatter.snippet
    ? tokenize(frontmatter.snippet.code, frontmatter.snippet.lang).reduce(
        function reducer(lines, token: TokenStream): Array<Array<Node>> {
          const lastLine = lines[lines.length - 1];
          if (typeof token === "string") {
            const [first, ...rest] = token.split("\n");
            return [
              ...lines.slice(0, -1),
              [...lastLine, { str: first }],
              ...rest.map((line) => [{ str: line }]),
            ];
          }
          if (Array.isArray(token)) {
            return token.reduce(reducer, lines);
          }
          const color = getColor(token);
          const [first, ...rest] = reducer([[]], token.content);
          return [
            ...lines.slice(0, -1),
            [...lastLine, ...first.map((node) => ({ color, ...node }))],
            ...rest.map((line) => line.map((node) => ({ color, ...node }))),
          ];
        },
        [[]],
      )
    : [];

  const svg = await satori(
    jsx("div", {
      style: {
        background: "white",
        width: "1200px",
        height: "630px",
        display: "flex",
        flexDirection: "column-reverse", // Draw header last for the box shadow
      },
      children: [
        jsx("div", {
          style: {
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            textAlign: "center",
            padding: "32px 64px",
            flexGrow: lines.length === 0 ? "1" : "0",
          },
          children: [
            jsx("div", {
              style: {
                textWrap: "balance",
                font: "56px 'Techna Sans'",
                lineHeight: "1",
              },
              children: frontmatter.title,
            }),
            jsx("div", {
              style: {
                font: "200 40px inter",
                marginTop: lines.length === 0 ? "16px" : "4px",
              },
              children: date ? formatDate(date) : "Unpublished draft",
            }),
            lines.length === 0 &&
              jsx("div", {
                style: {
                  font: "400 32px inter",
                  marginTop: lines.length === 0 ? "40px" : "0",
                  textWrap: "balance",
                },
                children: frontmatter.description,
              }),
          ],
        }),
        lines.length > 0 &&
          jsx("div", {
            style: {
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              flex: "1",
              color: "#1c1b1d",
              background: "#fafaff",
              padding: "16px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
              fontSize: "24px",
            },
            children: jsx("div", {
              style: {
                display: "flex",
                flexDirection: "column",
                minWidth: "800px",
              },
              children: lines.map((line) =>
                jsx("div", {
                  style: {
                    display: "flex",
                    whiteSpace: "pre",
                  },
                  children: line.map((node) =>
                    jsx("span", {
                      style: { color: node.color },
                      children: node.str,
                    }),
                  ),
                }),
              ),
            }),
          }),
        jsx("div", {
          style: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "16px",
            boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
            padding: "16px",
          },
          children: [
            jsx("img", {
              src: `data:image/svg+xml;base64,${Buffer.from(await read(favicon).arrayBuffer()).toString("base64")}`,
              width: 96,
              height: 96,
              style: { border: "1px solid black", borderRadius: "999px" },
            }),
            jsx("div", {
              style: {
                font: "64px 'Techna Sans'",
              },
              children: "gautier.dev",
            }),
          ],
        }),
      ],
    }),
    {
      width: 1200,
      height: 630,
      fonts: [
        {
          name: "0xProto",
          data: await read(zxproto).arrayBuffer(),
        },
        {
          name: "Techna Sans",
          data: await read(technasans).arrayBuffer(),
        },
        {
          name: "Inter",
          data: await read(inter200).arrayBuffer(),
          weight: 200,
        },
        {
          name: "Inter",
          data: await read(inter400).arrayBuffer(),
          weight: 400,
        },
      ],
    },
  );
  return new Response(await sharp(Buffer.from(svg)).png().toBuffer(), {
    headers: {
      "Content-Type": "image/png",
    },
  });
};
