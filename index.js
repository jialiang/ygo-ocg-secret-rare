import fs from "fs/promises";
import path from "path";
import postcss from "postcss";
import autoprefixer from "autoprefixer";
import { minify } from "html-minifier-terser";
import * as sass from "sass-embedded";

import copy from "./src/copy/index.js";
import fonts from "./src/fonts/index.js";

const clean = async () => {
  await fs.mkdir("./docs", { recursive: true });

  const files = await fs.readdir("./docs");

  const promises = files.map(async (file) => {
    await fs.rm(path.join("./docs", file), { recursive: true });
  });

  await Promise.all(promises);
};

async function clone(src, dest) {
  const [files] = await Promise.all([
    fs.readdir(src, { withFileTypes: true }),
    fs.mkdir(dest, { recursive: true }),
  ]);

  await Promise.all(
    files.map(async (file) => {
      const _src = path.join(src, file.name);
      const _dest = path.join(dest, file.name);

      if (file.isDirectory()) await clone(_src, _dest);
      else await fs.copyFile(_src, _dest);
    }),
  );
}

const generateHtml = async (cssObj, jsObj) => {
  const [inputHtml, copyHtml] = await Promise.all([
    fs.readFile("./src/index.html", { encoding: "utf-8" }),
    copy.createHtml(),
  ]);

  const outputHtml = inputHtml
    .replace("/* index.scss */", cssObj.index)
    .replace("// index.js", jsObj.index);

  const minifiedHtml = await minify(outputHtml, {
    collapseWhitespace: true,
    collapseInlineTagWhitespace: true,
    decodeEntities: true,
  });

  const minifiedHtmlWithCopy = minifiedHtml.replace("<!-- copy.html -->", copyHtml);

  await fs.writeFile("./docs/index.html", minifiedHtmlWithCopy);

  return minifiedHtmlWithCopy;
};

const generateCss = async () => {
  const path = "./src/styles/index.scss";
  const index = await sass.compileAsync(path, { style: "compressed" });

  const prefixedCss = await postcss(autoprefixer()).process(index.css, {
    from: path,
  });

  return { index: prefixedCss };
};

const generateJavaScript = async () => {
  const index = await fs.readFile("./src/scripts/index.js", { encoding: "utf-8" });

  return { index };
};

const generateFonts = fonts.subsetFonts;

const timeTask = async (task, level = 0, args = []) => {
  const start = performance.now();

  const result = await task(...args);

  const duration = performance.now() - start;
  console.log(`${" ".repeat(level * 2)}Task ${task.name} took ${Math.round(duration)}ms.`);

  return result;
};

const build = async () => {
  const start = performance.now();

  await timeTask(clean);

  const main = async () => {
    const [cssObj, jsObj] = await Promise.all([
      await timeTask(generateCss, 2),
      await timeTask(generateJavaScript, 2),
    ]);

    const htmlStr = await timeTask(generateHtml, 1, [cssObj, jsObj]);

    await timeTask(generateFonts, 1, [htmlStr, cssObj]);
  };

  await Promise.all([main(), timeTask(clone, 0, ["./static", "./docs"])]);

  console.log(`\nTook ${Math.round(performance.now() - start)}ms to build.\n`);

  process.stdout.write("\u0007");
};

build();
