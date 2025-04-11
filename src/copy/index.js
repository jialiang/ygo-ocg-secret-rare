import fs from "fs";

import { marked } from "marked";
import { gfmHeadingId, getHeadingList } from "marked-gfm-heading-id";

marked.use(gfmHeadingId(), {
  hooks: {
    postprocess(html) {
      const headings = getHeadingList();

      if (headings.length === 0) return html;

      let currentLevel = -1;
      let tableOfContents = "";

      headings.map(({ id, raw, level }) => {
        if (level === 1) return;

        if (level > currentLevel) tableOfContents += "<ol>";
        if (level < currentLevel) tableOfContents += "</ol>";

        currentLevel = level;

        tableOfContents += `<li><a href="#${id}" class="h${level}">${raw}</a></li>`;
      });

      tableOfContents += "</ol>".repeat(headings.at(-1).level - 1);

      return html.replace(
        "</h1>",
        `</h1> <nav aria-label="Table of Contents">${tableOfContents}</nav>`,
      );
    },
  },
});

export default {
  createHtml: async () => {
    const input = await new Promise((resolve, reject) => {
      fs.readFile("./src/copy/copy.md", "utf-8", (error, data) => {
        if (error) reject(error);
        else resolve(data);
      });
    });

    return `<div>${marked.parse(input)}</div>`;
  },
};
