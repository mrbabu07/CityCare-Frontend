import { readdir, readFile } from "node:fs/promises";
import { gzipSync } from "node:zlib";
import { join } from "node:path";

const directory = ".next/static/chunks";
const entries = [];
for (const name of await readdir(directory)) {
  if (!name.endsWith(".js")) continue;
  const bytes = await readFile(join(directory, name));
  entries.push({
    chunk: name,
    rawKiB: +(bytes.length / 1024).toFixed(1),
    gzipKiB: +(gzipSync(bytes).length / 1024).toFixed(1),
  });
}
entries.sort((a, b) => b.gzipKiB - a.gzipKiB);
console.log(
  "Largest production chunks (all routes, not initial-page transfer):",
);
console.table(entries.slice(0, 8));
console.log(`Total JavaScript chunks: ${entries.length}`);
