import { execFileSync } from "node:child_process";
import nextEnv from "@next/env";
nextEnv.loadEnvConfig(process.cwd());
const tracked = execFileSync("git", ["ls-files", "-z"], {
  encoding: "utf8",
}).split("\0");
const unsafe = tracked.filter(
  (path) => /(^|\/)\.env($|\.)/.test(path) && !path.endsWith(".env.example"),
);
if (unsafe.length) {
  console.error("FAIL: private env files tracked:", unsafe.join(", "));
  process.exitCode = 1;
} else console.log("PASS: no private env files tracked");
const required = [
  "BACKEND_API_URL",
  ...["ADMIN", "STAFF", "CITIZEN"].flatMap((role) => [
    `DEMO_${role}_EMAIL`,
    `DEMO_${role}_PASSWORD`,
  ]),
];
const missing = required.filter((name) => !process.env[name]);
if (missing.length) {
  console.error("Missing server environment variables:", missing.join(", "));
  process.exitCode = 1;
} else
  console.log(
    "PASS: all server environment variables present (values not printed)",
  );
const count = Number(
  execFileSync("git", ["rev-list", "--count", "HEAD"], {
    encoding: "utf8",
  }).trim(),
);
console.log(
  `${count} frontend commits; assignment requires 20 meaningful commits.`,
);
if (count < 20) console.log("PENDING: meaningful Git history requirement");
console.log(
  "Manual release gates: deployed role smoke tests, real sandbox payment, responsive workflow checks, video link.",
);
