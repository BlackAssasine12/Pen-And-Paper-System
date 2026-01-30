import { promises as fs } from "fs";
import path from "path";

const rootDir = process.cwd();
const srcDir = path.join(rootDir, "src");
const featuresDir = path.join(srcDir, "features");
const mainEntry = path.join(srcDir, "main.tsx");

const allowedExtensions = new Set([".ts", ".tsx", ".js", ".jsx", ".mjs"]);

const domOperationPatterns = [
  { label: "addEventListener", regex: /\.addEventListener\(/ },
  { label: "removeEventListener", regex: /\.removeEventListener\(/ },
  { label: "dispatchEvent", regex: /\.dispatchEvent\(/ },
  { label: "createElement", regex: /document\.createElement\(/ },
  { label: "createElementNS", regex: /document\.createElementNS\(/ },
  { label: "createRoot", regex: /createRoot\(/ },
  { label: "appendChild", regex: /\.appendChild\(/ },
  { label: "removeChild", regex: /\.removeChild\(/ },
  { label: "innerHTML", regex: /\.innerHTML\s*=/ },
  { label: "textContent", regex: /\.textContent\s*=/ },
  { label: "innerText", regex: /\.innerText\s*=/ },
  { label: "style", regex: /\.style\./ },
  { label: "classList", regex: /\.classList\./ },
  { label: "setAttribute", regex: /\.setAttribute\(/ },
  { label: "removeAttribute", regex: /\.removeAttribute\(/ },
  { label: "closest", regex: /\.closest\(/ },
  { label: "append", regex: /\.append\(/ },
  { label: "querySelector", regex: /\.querySelector\(/ },
  { label: "querySelectorAll", regex: /\.querySelectorAll\(/ },
  { label: "getElementById", regex: /getElementById\(/ },
];

const getFeatureName = (filePath) => {
  const normalized = filePath.replace(/\\/g, "/");
  const marker = "/src/features/";
  const idx = normalized.indexOf(marker);
  if (idx === -1) {
    return "core";
  }
  const remainder = normalized.slice(idx + marker.length);
  return remainder.split("/")[0] || "core";
};

const walkDir = async (dir, files = []) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walkDir(fullPath, files);
      continue;
    }
    if (!allowedExtensions.has(path.extname(entry.name))) {
      continue;
    }
    files.push(fullPath);
  }
  return files;
};

const collectMatches = (content, regex, transform = (match) => match) => {
  const results = [];
  let match;
  const globalRegex = new RegExp(regex.source, `${regex.flags}g`);
  while ((match = globalRegex.exec(content)) !== null) {
    results.push(transform(match));
  }
  return results;
};

const summarizeFile = (content) => {
  const windowGlobals = new Set(
    collectMatches(content, /window\.([A-Za-z0-9_$]+)/, (match) => match[1])
  );

  const domIds = new Set(
    collectMatches(content, /getElementById\(\s*['"`]([^'"`]+)['"`]\s*\)/, (match) => match[1])
  );

  const domIdTemplates = new Set(
    collectMatches(content, /getElementById\(\s*`([^`]+)`\s*\)/, (match) => match[1])
      .filter((template) => template.includes("${"))
      .map((template) => `template:${template}`)
  );

  const selectors = new Set(
    collectMatches(
      content,
      /querySelector(All)?(?:<[^>]*>)?\(\s*['"`]([^'"`]+)['"`]\s*\)/,
      (match) => match[2]
    )
  );

  const domOperations = new Set();
  domOperationPatterns.forEach(({ label, regex }) => {
    if (regex.test(content)) {
      domOperations.add(label);
    }
  });

  return {
    windowGlobals,
    domIds,
    domIdTemplates,
    selectors,
    domOperations,
  };
};

const mergeSets = (target, source) => {
  source.forEach((value) => target.add(value));
};

const main = async () => {
  const files = [];
  try {
    await fs.access(featuresDir);
    await walkDir(featuresDir, files);
  } catch {
    // ignore missing features directory
  }

  try {
    await fs.access(mainEntry);
    files.push(mainEntry);
  } catch {
    // ignore missing main entry
  }

  const report = {};

  for (const file of files) {
    const content = await fs.readFile(file, "utf8");
    const summary = summarizeFile(content);
    const featureName = getFeatureName(file);

    if (!report[featureName]) {
      report[featureName] = {
        files: [],
        windowGlobals: new Set(),
        domIds: new Set(),
        domIdTemplates: new Set(),
        selectors: new Set(),
        domOperations: new Set(),
      };
    }

    report[featureName].files.push(path.relative(rootDir, file));
    mergeSets(report[featureName].windowGlobals, summary.windowGlobals);
    mergeSets(report[featureName].domIds, summary.domIds);
    mergeSets(report[featureName].domIdTemplates, summary.domIdTemplates);
    mergeSets(report[featureName].selectors, summary.selectors);
    mergeSets(report[featureName].domOperations, summary.domOperations);
  }

  const output = Object.fromEntries(
    Object.entries(report).map(([feature, data]) => [
      feature,
      {
        files: data.files.sort(),
        windowGlobals: Array.from(data.windowGlobals).sort(),
        domIds: Array.from(data.domIds).sort(),
        domIdTemplates: Array.from(data.domIdTemplates).sort(),
        selectors: Array.from(data.selectors).sort(),
        domOperations: Array.from(data.domOperations).sort(),
      },
    ])
  );

  const outputPath = path.join(rootDir, "legacy-deps-report.json");
  await fs.writeFile(outputPath, `${JSON.stringify(output, null, 2)}\n`, "utf8");
  console.log(`Legacy dependency report written to ${path.relative(rootDir, outputPath)}`);
};

await main();
