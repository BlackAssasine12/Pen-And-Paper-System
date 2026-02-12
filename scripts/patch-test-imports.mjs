import { readFile, readdir, stat, writeFile } from "node:fs/promises";
import { join, extname } from "node:path";

const root = new URL("../dist-tests", import.meta.url);

const shouldRewrite = (specifier) => {
  if (!specifier.startsWith("./") && !specifier.startsWith("../")) {
    return false;
  }
  const extension = extname(specifier);
  return extension === "";
};

const rewriteSpecifiers = (content) => {
  const fromRegex = /(from\s+["'])([^"']+)(["'])/g;
  const importRegex = /(import\(\s*["'])([^"']+)(["']\s*\))/g;

  const rewrite = (_match, prefix, specifier, suffix) => {
    if (!shouldRewrite(specifier)) {
      return `${prefix}${specifier}${suffix}`;
    }
    return `${prefix}${specifier}.js${suffix}`;
  };

  return content.replace(fromRegex, rewrite).replace(importRegex, rewrite);
};

const patchFile = async (filePath) => {
  const content = await readFile(filePath, "utf-8");
  const updated = rewriteSpecifiers(content);
  if (updated !== content) {
    await writeFile(filePath, updated, "utf-8");
  }
};

const walk = async (dir) => {
  const entries = await readdir(dir, { withFileTypes: true });
  await Promise.all(
    entries.map(async (entry) => {
      const entryPath = join(dir, entry.name);
      if (entry.isDirectory()) {
        await walk(entryPath);
        return;
      }
      if (entry.isFile() && entry.name.endsWith(".js")) {
        await patchFile(entryPath);
      }
    })
  );
};

const stats = await stat(root);
if (stats.isDirectory()) {
  await walk(root.pathname);
}
