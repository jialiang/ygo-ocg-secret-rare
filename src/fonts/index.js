import fs from "fs/promises";
import { spawn } from "child_process";

import postcss from "postcss";
import selectorParser from "postcss-selector-parser";
import { selectorSpecificity } from "@csstools/selector-specificity";

import { Parser as HtmlParser, DomUtils, DomHandler } from "htmlparser2";
import * as cssSelect from "css-select";

const normalizeValue = (value) => {
  if (value === "700") return "Bold";
  if (value === "600") return "Semibold";
  if (value === "500") return "Medium";
  if (value === "400") return "Regular";

  if (value.includes("Yu-Gi-Oh! DFG Leisho 4")) return "Yu-Gi-Oh! DFG Leisho 4";
  if (value.includes("Stone Serif")) return "Stone Serif";
  if (value.includes("Yu-Gi-Oh! Matrix Small Caps 2")) return "Yu-Gi-Oh! Matrix Small Caps 2";
  if (value.includes("FOT-Rodin Pro M")) return "FOT-Rodin Pro M";
  if (value.includes("Roboto Condensed")) return "Roboto Condensed";
  if (value.includes("Lobster Two")) return "Lobster Two";

  return false;
};

const subsetFonts = async (htmlStr, cssObj) => {
  const browserCss = `
    html { font-weight: 400; }
    h1, h2, h3, h4, b, strong { font-weight: 700; }
  `;

  const css = browserCss + Object.values(cssObj).join("\n\n");
  const ast = await postcss().process(css, { from: undefined });

  const selectorProcessor = selectorParser();
  const fontWeightSelectors = [];
  const fontToCharacters = {};

  ast.root.nodes.forEach(({ selector, nodes }, index) => {
    if (!selector || selector.includes("::")) return;

    for (const { prop, value } of nodes) {
      if (prop !== "font-family" && prop !== "font-weight") continue;
      if (value === "inherit") continue;

      const normalizedValue = normalizeValue(value);
      if (!normalizedValue) continue;

      selector.split(",").forEach((part) => {
        const selectorAst = selectorProcessor.astSync(part);
        const { a, b, c } = selectorSpecificity(selectorAst);

        const compiledQuery = cssSelect.compile(`${part}, ${part} *`);

        fontWeightSelectors.push({
          prop: prop.split("-")[1],
          value: normalizedValue,
          a,
          b,
          c,
          index,
          compiledQuery,
        });
      });
    }
  });

  fontWeightSelectors.sort(
    (s1, s2) => s2.a - s1.a || s2.b - s1.b || s2.c - s1.c || s2.index - s1.index,
  );

  const dom = await new Promise((resolve, reject) => {
    const domHandler = new DomHandler((error, dom) => {
      if (error) reject(error);
      else resolve(dom);
    });

    new HtmlParser(domHandler).parseComplete(htmlStr);
  });

  cssSelect.selectAll("head, script, style", dom).forEach((node) => {
    DomUtils.removeElement(node);
  });

  DomUtils.findAll((node) => {
    for (const selector of fontWeightSelectors) {
      const { prop, value, compiledQuery } = selector;

      if (node[prop] || !cssSelect.is(node, compiledQuery)) continue;

      node[prop] = value;

      if (!node.family || !node.weight) continue;

      const { family, weight } = node;

      for (const child of node.children) {
        if (child.type !== "text") continue;

        fontToCharacters[`${family} ${weight}`] ??= "";
        fontToCharacters[`${family} ${weight}`] += child.data;
      }

      break;
    }
  }, dom);

  await fs.mkdir("./docs/fonts", { recursive: true });

  const subsetTasks = [];

  Object.entries(fontToCharacters).forEach(([fontName, characters]) => {
    const characterArray = characters.split("");
    const uniqueCharactersSet = new Set(characterArray);
    const textToSubset = Array.from(uniqueCharactersSet)
      .filter((character) => character.charCodeAt(0) >= 0x20)
      .join("");

    const formats = ["woff", "woff2"];

    formats.forEach((format) => {
      const subsetTask = new Promise((resolve, reject) => {
        const childProcess = spawn(
          "pyftsubset",
          [
            `./src/fonts/originals/${fontName}.ttf`,
            `--text=${textToSubset}`,
            "--no-ignore-missing-unicodes",
            `--output-file=./docs/fonts/${fontName}.${format}`,
            `--flavor=${format}`,
            "--with-zopfli",
            "--harfbuzz-repacker",
          ],
          { stdio: "inherit" },
        );

        childProcess.on("error", reject);

        childProcess.on("exit", (code) => {
          if (code === 0) resolve();
          else reject(new Error(`pyftsubset failed for ${fontName}.${format} (exit code ${code})`));
        });
      });

      subsetTasks.push(subsetTask);
    });
  });

  await Promise.all(subsetTasks);
};

export default { subsetFonts };
