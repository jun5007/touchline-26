import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");

const APPROVED_LICENSE_IDENTIFIERS = new Set([
  "0BSD",
  "Apache-2.0",
  "BSD-2-Clause",
  "BSD-3-Clause",
  "BlueOak-1.0.0",
  "CC-BY-4.0",
  "CC0-1.0",
  "ISC",
  "LGPL-3.0-or-later",
  "MIT",
  "MIT-0",
  "MPL-2.0",
  "Python-2.0",
]);

const REQUIRED_NOTICE_MARKERS = new Map([
  ["@dnd-kit/core", ["dnd-kit"]],
  ["next", ["Next.js"]],
  ["react", ["React"]],
  ["react-dom", ["React DOM"]],
]);

function extractLicenseIdentifiers(expression) {
  return expression
    .replace(/[()]/gu, " ")
    .split(/\s+(?:AND|OR|WITH)\s+|\s+/gu)
    .map((value) => value.trim())
    .filter(Boolean);
}

function packageNameFromLockPath(lockPath) {
  if (!lockPath.startsWith("node_modules/")) {
    return lockPath || "<project root>";
  }
  return lockPath.slice("node_modules/".length);
}

const packageJson = JSON.parse(
  await readFile(path.join(projectRoot, "package.json"), "utf8"),
);
const packageLock = JSON.parse(
  await readFile(path.join(projectRoot, "package-lock.json"), "utf8"),
);
const notices = await readFile(
  path.join(projectRoot, "THIRD_PARTY_NOTICES.md"),
  "utf8",
);

const failures = [];
if (packageJson.private !== true) {
  failures.push("package.json must remain private unless a project license is selected.");
}
if (typeof packageJson.license === "string" && packageJson.license.trim()) {
  const identifiers = extractLicenseIdentifiers(packageJson.license);
  const unknown = identifiers.filter(
    (identifier) => !APPROVED_LICENSE_IDENTIFIERS.has(identifier),
  );
  if (unknown.length > 0) {
    failures.push(`Project license is not allowlisted: ${unknown.join(", ")}`);
  }
} else if (
  !notices.includes("No project-level open-source license has been selected")
) {
  failures.push(
    "The private package has no license and THIRD_PARTY_NOTICES.md does not disclose that status.",
  );
}

const lockPackages = packageLock.packages;
if (!lockPackages || typeof lockPackages !== "object") {
  failures.push("package-lock.json does not contain a packages map.");
}

const licenseCounts = new Map();
let checkedPackageCount = 0;
if (lockPackages && typeof lockPackages === "object") {
  for (const [lockPath, metadata] of Object.entries(lockPackages)) {
    if (lockPath === "") {
      continue;
    }
    checkedPackageCount += 1;
    const license = typeof metadata.license === "string"
      ? metadata.license.trim()
      : "";
    if (!license) {
      failures.push(`Missing license metadata: ${packageNameFromLockPath(lockPath)}`);
      continue;
    }
    licenseCounts.set(license, (licenseCounts.get(license) ?? 0) + 1);
    const identifiers = extractLicenseIdentifiers(license);
    const unknown = identifiers.filter(
      (identifier) => !APPROVED_LICENSE_IDENTIFIERS.has(identifier),
    );
    if (unknown.length > 0) {
      failures.push(
        `Unapproved license metadata for ${packageNameFromLockPath(lockPath)}: ${license}`,
      );
    }
  }
}

for (const [dependencyName, markers] of REQUIRED_NOTICE_MARKERS) {
  const directVersion = packageJson.dependencies?.[dependencyName];
  if (!directVersion) {
    failures.push(`Expected runtime dependency is missing: ${dependencyName}`);
    continue;
  }
  const lockEntry = lockPackages?.[`node_modules/${dependencyName}`];
  if (!lockEntry) {
    failures.push(`Runtime dependency is missing from package-lock.json: ${dependencyName}`);
  }
  if (!markers.some((marker) => notices.includes(marker))) {
    failures.push(`THIRD_PARTY_NOTICES.md is missing attribution for ${dependencyName}.`);
  }
}

if (!notices.includes("Open-source runtime")) {
  failures.push("THIRD_PARTY_NOTICES.md is missing the open-source runtime section.");
}
if (!notices.includes("Project code rights")) {
  failures.push("THIRD_PARTY_NOTICES.md is missing the project code rights section.");
}

console.log(`packages checked: ${checkedPackageCount}`);
console.log(`approved SPDX expressions: ${licenseCounts.size}`);
for (const [license, count] of [...licenseCounts].sort(([left], [right]) =>
  left.localeCompare(right)
)) {
  console.log(`  ${license}: ${count}`);
}
console.log(
  `project license: ${packageJson.license || "not selected (private package; disclosed)"}`,
);
console.log(`THIRD_PARTY_NOTICES.md: ${failures.length === 0 ? "PASS" : "FAIL"}`);

if (failures.length > 0) {
  console.error("License check failed:");
  for (const failure of failures) {
    console.error(`  - ${failure}`);
  }
  process.exitCode = 1;
} else {
  console.log("license:check PASS");
}
