import { readFile } from "fs/promises";

import { marked } from "marked";
import { getHeadingList, gfmHeadingId } from "marked-gfm-heading-id";

marked.use(gfmHeadingId(), {
  hooks: {
    postprocess(html) {
      const headings = getHeadingList().filter(({ level }) => level === 2);

      if (headings.length === 0) return html;

      const items = headings
        .map(({ id, raw }) => `<li><a href="#${id}" class="h2">${raw}</a></li>`)
        .join("");

      return html.replace("<h2", `<nav aria-label="Table of Contents"><ol>${items}</ol></nav> <h2`);
    },
  },
});

export default {
  createHtml: async () => {
    const input = await readFile("./src/copy/copy.md", "utf-8");

    return `<div>${marked.parse(input)}</div>`;
  },
};
