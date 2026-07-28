import { inflateRawSync, deflateRawSync } from "node:zlib";
import {
  lstat,
  readFile,
  readdir,
} from "node:fs/promises";
import path from "node:path";

export const BUNDLE_FILENAME = "TOUCHLINE26_RELEASE_CANDIDATE_AUDIT.zip";

export const REQUIRED_SCREENSHOTS = [
  "01-home.png",
  "02-country-selection.png",
  "03-group-a.png",
  "04-team-journey.png",
  "05-mission-briefing.png",
  "06-tactics-before.png",
  "07-player-comparison-no-base-data.png",
  "08-tactical-decision-fit.png",
  "09-result.png",
  "10-actual-manager-comparison.png",
  "11-progress.png",
  "12-group-stage-report.png",
  "13-mobile-tactics.png",
  "14-mobile-result.png",
  "15-mobile-report.png",
];

const REQUIRED_SUBMISSION_DOCUMENTS = [
  "SUBMISSION_FINAL_SUMMARY.md",
  "SUBMISSION_TEST_RESULTS.md",
  "SUBMISSION_KNOWN_ISSUES.md",
  "SUBMISSION_RELEASE_CHECKLIST.md",
];

const REQUIRED_RELEASE_CANDIDATE_DOCUMENTS = [
  "FINAL_RELEASE_FILE_LIST.md",
  "RELEASE_CANDIDATE_SUMMARY.md",
  "RELEASE_CANDIDATE_TEST_RESULTS.md",
  "RELEASE_CANDIDATE_KNOWN_ISSUES.md",
  "RELEASE_CANDIDATE_CHANGED_FILES.md",
];

const ROOT_ALLOWLIST = new Set([
  ".gitignore",
  ".npmrc",
  "AGENTS.md",
  "CLAUDE.md",
  "Dockerfile",
  "LICENSE",
  "LICENSE.md",
  "LICENSE.txt",
  "README.md",
  "THIRD_PARTY_NOTICES.md",
  "components.json",
  "eslint.config.mjs",
  "instrumentation.ts",
  "middleware.ts",
  "next.config.ts",
  "package-lock.json",
  "package.json",
  "playwright.config.ts",
  "postcss.config.mjs",
  "tailwind.config.js",
  "tailwind.config.ts",
  "tsconfig.json",
  "vercel.json",
  "vitest.config.ts",
  ...REQUIRED_SUBMISSION_DOCUMENTS,
  ...REQUIRED_RELEASE_CANDIDATE_DOCUMENTS,
]);

const ALLOWED_TOP_LEVEL_DIRECTORIES = new Set([
  ".github",
  "docs",
  "e2e",
  "public",
  "scripts",
  "src",
  "tests",
]);

const EXCLUDED_ALLOWLIST_PREFIXES = [
  "docs/base-profile-screenshots/",
  "docs/final-review-screenshots/",
  "docs/images/",
  "docs/screenshots/",
];

const EXCLUDED_ALLOWLIST_FILES = new Set([
  "public/og.png",
  "scripts/build-base-profile-review-bundle.ps1",
]);

const ALLOWED_EXTENSIONS = new Set([
  ".cjs",
  ".css",
  ".csv",
  ".gif",
  ".html",
  ".ico",
  ".jpeg",
  ".jpg",
  ".js",
  ".json",
  ".jsonl",
  ".jsx",
  ".md",
  ".mjs",
  ".png",
  ".ps1",
  ".py",
  ".scss",
  ".sh",
  ".svg",
  ".toml",
  ".ts",
  ".tsv",
  ".tsx",
  ".txt",
  ".webp",
  ".woff",
  ".woff2",
  ".xml",
  ".yaml",
  ".yml",
]);

const ALLOWED_EXTENSIONLESS_FILENAMES = new Set([
  "Dockerfile",
]);

const FORBIDDEN_DIRECTORY_SEGMENTS = new Set([
  ".cache",
  ".git",
  ".mypy_cache",
  ".next",
  ".npm-cache",
  ".parcel-cache",
  ".pnpm-store",
  ".pytest_cache",
  ".review-npm-cache",
  ".review-pnpm-store",
  ".review-runtime",
  ".review-tmp",
  ".review-tooling",
  ".ruff_cache",
  ".tox",
  ".turbo",
  ".venv",
  ".vercel",
  ".yarn",
  "__pycache__",
  "cache",
  "coverage",
  "dist",
  "env",
  "logs",
  "node_modules",
  "tmp",
  "venv",
]);

const FORBIDDEN_FILE_EXTENSIONS = new Set([
  ".crt",
  ".der",
  ".key",
  ".log",
  ".p12",
  ".pfx",
  ".pdf",
  ".pem",
  ".zip",
]);

const CREDENTIAL_FILENAMES = [
  /^credentials(?:\.[^.]+)?$/i,
  /^service[-_.]?account.*\.json$/i,
  /^token(?:\.[^.]+)?$/i,
  /^id_(?:rsa|dsa|ecdsa|ed25519)(?:\.pub)?$/i,
];

const TEXT_EXTENSIONS = new Set([
  "",
  ".cjs",
  ".css",
  ".csv",
  ".html",
  ".js",
  ".json",
  ".jsonl",
  ".jsx",
  ".md",
  ".mjs",
  ".ps1",
  ".py",
  ".scss",
  ".sh",
  ".svg",
  ".toml",
  ".ts",
  ".tsv",
  ".tsx",
  ".txt",
  ".xml",
  ".yaml",
  ".yml",
]);

const LOCAL_USER_PATH_PATTERNS = [
  {
    label: "Windows absolute path",
    pattern: /\b[A-Za-z]:[\\/]+[^:*?"<>|\r\n]+/gu,
  },
  {
    label: "Windows UNC path",
    pattern: /\\\\[^\\/\s"'`<>]+[\\/][^\\/\s"'`<>]+(?:[\\/][^\\/\r\n"'`<>]+)*/gu,
  },
  {
    label: "macOS user directory",
    pattern: /(?<![A-Za-z]:)\/Users\/[^/\s"'`<>]+/gu,
  },
  {
    label: "Linux user directory",
    pattern: /\/home\/[^/\s"'`<>]+/gu,
  },
];

const HIGH_CONFIDENCE_SECRET_PATTERNS = [
  {
    label: "private key",
    pattern: /-----BEGIN (?:RSA |EC |OPENSSH |DSA )?PRIVATE KEY-----/gu,
  },
  {
    label: "GitHub token",
    pattern: /\bgh[pousr]_[A-Za-z0-9]{36,}\b/gu,
  },
  {
    label: "GitHub fine-grained token",
    pattern: /\bgithub_pat_[A-Za-z0-9_]{50,}\b/gu,
  },
  {
    label: "OpenAI API key",
    pattern: /\bsk-(?:proj-|svcacct-)?[A-Za-z0-9_-]{32,}\b/gu,
  },
  {
    label: "AWS access key",
    pattern: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/gu,
  },
  {
    label: "Google API key",
    pattern: /\bAIza[0-9A-Za-z_-]{35}\b/gu,
  },
  {
    label: "Slack token",
    pattern: /\bxox[baprs]-[A-Za-z0-9-]{20,}\b/gu,
  },
  {
    label: "npm access token",
    pattern: /\bnpm_[A-Za-z0-9]{36,}\b/gu,
  },
  {
    label: "Stripe live secret",
    pattern: /\b(?:sk|rk)_live_[A-Za-z0-9]{20,}\b/gu,
  },
];

const CREDENTIAL_ASSIGNMENT_PATTERN =
  /\b(?:api[_-]?key|access[_-]?token|auth[_-]?token|client[_-]?secret|secret[_-]?key)\b\s*[:=]\s*["']([A-Za-z0-9_./+=-]{24,256})["']/giu;

const CRC_TABLE = createCrcTable();

function createCrcTable() {
  const table = new Uint32Array(256);
  for (let index = 0; index < 256; index += 1) {
    let value = index;
    for (let bit = 0; bit < 8; bit += 1) {
      value = (value & 1) === 1
        ? (value >>> 1) ^ 0xedb88320
        : value >>> 1;
    }
    table[index] = value >>> 0;
  }
  return table;
}

export function crc32(input) {
  const buffer = Buffer.isBuffer(input) ? input : Buffer.from(input);
  let crc = 0xffffffff;
  for (const byte of buffer) {
    crc = (crc >>> 8) ^ CRC_TABLE[(crc ^ byte) & 0xff];
  }
  return (crc ^ 0xffffffff) >>> 0;
}

export function normalizeArchivePath(input) {
  return String(input).replaceAll("\\", "/").replace(/^\.\/+/u, "");
}

function pathSegments(archivePath) {
  return archivePath.toLowerCase().split("/").filter(Boolean);
}

export function findForbiddenArchivePathReason(archivePath) {
  const normalized = normalizeArchivePath(archivePath);
  const segments = pathSegments(normalized);
  const basename = segments.at(-1) ?? "";
  const extension = path.posix.extname(basename);

  if (
    normalized.startsWith("/")
    || /^[A-Za-z]:/u.test(normalized)
    || segments.includes("..")
    || normalized.includes("\0")
  ) {
    return "unsafe or absolute archive path";
  }
  if (segments.some((segment) => FORBIDDEN_DIRECTORY_SEGMENTS.has(segment))) {
    return "forbidden directory";
  }
  if (segments.some((segment) => segment.startsWith(".env"))) {
    return "environment file";
  }
  if (normalized.toLowerCase().startsWith("docs/sources/")) {
    return "restricted source-material directory";
  }
  if (FORBIDDEN_FILE_EXTENSIONS.has(extension)) {
    return `forbidden ${extension || "file"} extension`;
  }
  if (CREDENTIAL_FILENAMES.some((pattern) => pattern.test(basename))) {
    return "credential filename";
  }
  return null;
}

export function isAllowlistedProjectPath(archivePath) {
  const normalized = normalizeArchivePath(archivePath);
  if (
    EXCLUDED_ALLOWLIST_FILES.has(normalized)
    || EXCLUDED_ALLOWLIST_PREFIXES.some((prefix) => normalized.startsWith(prefix))
  ) {
    return false;
  }
  const segments = normalized.split("/");
  if (segments.length === 1) {
    return ROOT_ALLOWLIST.has(normalized);
  }
  if (!ALLOWED_TOP_LEVEL_DIRECTORIES.has(segments[0])) {
    return false;
  }
  const basename = segments.at(-1);
  const extension = path.posix.extname(basename).toLowerCase();
  return (
    ALLOWED_EXTENSIONS.has(extension)
    || ALLOWED_EXTENSIONLESS_FILENAMES.has(basename)
  );
}

export function isTextArchivePath(archivePath) {
  const basename = path.posix.basename(archivePath);
  if (ALLOWED_EXTENSIONLESS_FILENAMES.has(basename)) {
    return true;
  }
  return TEXT_EXTENSIONS.has(path.posix.extname(basename).toLowerCase());
}

function resetAndCollect(pattern, text) {
  pattern.lastIndex = 0;
  return [...text.matchAll(pattern)].map((match) => match[0]);
}

export function inspectTextContent(archivePath, data) {
  if (!isTextArchivePath(archivePath)) {
    return { localPaths: [], secrets: [] };
  }
  const text = Buffer.isBuffer(data) ? data.toString("utf8") : String(data);
  const localPaths = [];
  const secrets = [];
  for (const candidate of LOCAL_USER_PATH_PATTERNS) {
    for (const value of resetAndCollect(candidate.pattern, text)) {
      localPaths.push({ type: candidate.label, value });
    }
  }
  for (const candidate of HIGH_CONFIDENCE_SECRET_PATTERNS) {
    const count = resetAndCollect(candidate.pattern, text).length;
    if (count > 0) {
      secrets.push({ type: candidate.label, count });
    }
  }
  CREDENTIAL_ASSIGNMENT_PATTERN.lastIndex = 0;
  let assignmentMatch;
  let assignmentCount = 0;
  while (
    (assignmentMatch = CREDENTIAL_ASSIGNMENT_PATTERN.exec(text)) !== null
  ) {
    const value = assignmentMatch[1];
    const normalizedValue = value.toLowerCase();
    const isPlaceholder = [
      "dummy",
      "example",
      "placeholder",
      "replace",
      "sample",
      "test",
      "your_",
    ].some((marker) => normalizedValue.includes(marker));
    const characterClasses = [
      /[a-z]/u.test(value),
      /[A-Z]/u.test(value),
      /\d/u.test(value),
      /[_./+=-]/u.test(value),
    ].filter(Boolean).length;
    if (!isPlaceholder && characterClasses >= 3) {
      assignmentCount += 1;
    }
  }
  if (assignmentCount > 0) {
    secrets.push({
      type: "credential assignment",
      count: assignmentCount,
    });
  }
  return { localPaths, secrets };
}

async function walkFiles(rootDirectory, currentDirectory, output) {
  const directoryEntries = await readdir(currentDirectory, {
    withFileTypes: true,
  });
  directoryEntries.sort((left, right) => left.name.localeCompare(right.name));

  for (const directoryEntry of directoryEntries) {
    const absolutePath = path.join(currentDirectory, directoryEntry.name);
    const relativePath = path.relative(rootDirectory, absolutePath);
    const archivePath = normalizeArchivePath(relativePath);
    const forbiddenReason = findForbiddenArchivePathReason(archivePath);
    if (forbiddenReason) {
      continue;
    }
    if (directoryEntry.isSymbolicLink()) {
      throw new Error(`Symbolic links are not allowed in the bundle: ${archivePath}`);
    }
    if (directoryEntry.isDirectory()) {
      const topLevel = archivePath.split("/")[0];
      if (ALLOWED_TOP_LEVEL_DIRECTORIES.has(topLevel)) {
        await walkFiles(rootDirectory, absolutePath, output);
      }
      continue;
    }
    if (directoryEntry.isFile() && isAllowlistedProjectPath(archivePath)) {
      output.push({ absolutePath, name: archivePath });
    }
  }
}

export async function collectAllowlistedFiles(rootDirectory) {
  const resolvedRoot = path.resolve(rootDirectory);
  const rootStat = await lstat(resolvedRoot);
  if (!rootStat.isDirectory()) {
    throw new Error(`Project root is not a directory: ${resolvedRoot}`);
  }
  const files = [];
  await walkFiles(resolvedRoot, resolvedRoot, files);
  files.sort((left, right) => left.name.localeCompare(right.name));
  return files;
}

export async function loadProjectEntries(rootDirectory) {
  const files = await collectAllowlistedFiles(rootDirectory);
  return Promise.all(
    files.map(async (file) => ({
      name: file.name,
      data: await readFile(file.absolutePath),
    })),
  );
}

function zipLocalHeader({ nameBuffer, crc, compressedSize, size }) {
  const header = Buffer.alloc(30);
  header.writeUInt32LE(0x04034b50, 0);
  header.writeUInt16LE(20, 4);
  header.writeUInt16LE(0x0800, 6);
  header.writeUInt16LE(8, 8);
  header.writeUInt16LE(0, 10);
  header.writeUInt16LE(33, 12);
  header.writeUInt32LE(crc, 14);
  header.writeUInt32LE(compressedSize, 18);
  header.writeUInt32LE(size, 22);
  header.writeUInt16LE(nameBuffer.length, 26);
  header.writeUInt16LE(0, 28);
  return header;
}

function zipCentralHeader({
  nameBuffer,
  crc,
  compressedSize,
  size,
  localOffset,
}) {
  const header = Buffer.alloc(46);
  header.writeUInt32LE(0x02014b50, 0);
  header.writeUInt16LE(0x0314, 4);
  header.writeUInt16LE(20, 6);
  header.writeUInt16LE(0x0800, 8);
  header.writeUInt16LE(8, 10);
  header.writeUInt16LE(0, 12);
  header.writeUInt16LE(33, 14);
  header.writeUInt32LE(crc, 16);
  header.writeUInt32LE(compressedSize, 20);
  header.writeUInt32LE(size, 24);
  header.writeUInt16LE(nameBuffer.length, 28);
  header.writeUInt16LE(0, 30);
  header.writeUInt16LE(0, 32);
  header.writeUInt16LE(0, 34);
  header.writeUInt16LE(0, 36);
  header.writeUInt32LE((0o100644 << 16) >>> 0, 38);
  header.writeUInt32LE(localOffset, 42);
  return header;
}

export function createZipBuffer(entries) {
  if (entries.length > 0xffff) {
    throw new Error("ZIP64 is not supported: too many bundle entries.");
  }
  const localParts = [];
  const centralParts = [];
  const seen = new Set();
  let localOffset = 0;

  for (const entry of entries) {
    const name = normalizeArchivePath(entry.name);
    if (!name || seen.has(name)) {
      throw new Error(`Invalid or duplicate ZIP entry: ${name || "<empty>"}`);
    }
    seen.add(name);
    const forbiddenReason = findForbiddenArchivePathReason(name);
    if (forbiddenReason) {
      throw new Error(`Refusing forbidden ZIP entry ${name}: ${forbiddenReason}`);
    }
    const data = Buffer.isBuffer(entry.data)
      ? entry.data
      : Buffer.from(entry.data);
    const nameBuffer = Buffer.from(name, "utf8");
    const compressed = deflateRawSync(data, { level: 9 });
    if (
      nameBuffer.length > 0xffff
      || data.length > 0xffffffff
      || compressed.length > 0xffffffff
      || localOffset > 0xffffffff
    ) {
      throw new Error(`ZIP64 is not supported for entry: ${name}`);
    }
    const crc = crc32(data);
    const localHeader = zipLocalHeader({
      nameBuffer,
      crc,
      compressedSize: compressed.length,
      size: data.length,
    });
    localParts.push(localHeader, nameBuffer, compressed);
    centralParts.push(
      zipCentralHeader({
        nameBuffer,
        crc,
        compressedSize: compressed.length,
        size: data.length,
        localOffset,
      }),
      nameBuffer,
    );
    localOffset += localHeader.length + nameBuffer.length + compressed.length;
  }

  const centralDirectory = Buffer.concat(centralParts);
  if (
    centralDirectory.length > 0xffffffff
    || localOffset > 0xffffffff
  ) {
    throw new Error("ZIP64 is not supported: bundle is too large.");
  }
  const end = Buffer.alloc(22);
  end.writeUInt32LE(0x06054b50, 0);
  end.writeUInt16LE(0, 4);
  end.writeUInt16LE(0, 6);
  end.writeUInt16LE(entries.length, 8);
  end.writeUInt16LE(entries.length, 10);
  end.writeUInt32LE(centralDirectory.length, 12);
  end.writeUInt32LE(localOffset, 16);
  end.writeUInt16LE(0, 20);
  return Buffer.concat([...localParts, centralDirectory, end]);
}

function findEndOfCentralDirectory(zipBuffer) {
  const minimumOffset = Math.max(0, zipBuffer.length - 65_557);
  for (let offset = zipBuffer.length - 22; offset >= minimumOffset; offset -= 1) {
    if (zipBuffer.readUInt32LE(offset) === 0x06054b50) {
      return offset;
    }
  }
  throw new Error("Invalid ZIP: end of central directory was not found.");
}

function assertBufferRange(buffer, offset, length, label) {
  if (offset < 0 || length < 0 || offset + length > buffer.length) {
    throw new Error(`Invalid ZIP range for ${label}.`);
  }
}

export function readZipEntries(zipBufferInput) {
  const zipBuffer = Buffer.isBuffer(zipBufferInput)
    ? zipBufferInput
    : Buffer.from(zipBufferInput);
  if (zipBuffer.length < 22) {
    throw new Error("Invalid ZIP: file is too short.");
  }
  const endOffset = findEndOfCentralDirectory(zipBuffer);
  const diskNumber = zipBuffer.readUInt16LE(endOffset + 4);
  const centralDisk = zipBuffer.readUInt16LE(endOffset + 6);
  const entryCount = zipBuffer.readUInt16LE(endOffset + 10);
  const centralSize = zipBuffer.readUInt32LE(endOffset + 12);
  const centralOffset = zipBuffer.readUInt32LE(endOffset + 16);
  if (diskNumber !== 0 || centralDisk !== 0) {
    throw new Error("Multi-disk ZIP files are not supported.");
  }
  assertBufferRange(zipBuffer, centralOffset, centralSize, "central directory");

  const entries = [];
  const names = new Set();
  let offset = centralOffset;
  for (let index = 0; index < entryCount; index += 1) {
    assertBufferRange(zipBuffer, offset, 46, "central directory header");
    if (zipBuffer.readUInt32LE(offset) !== 0x02014b50) {
      throw new Error("Invalid ZIP: malformed central directory header.");
    }
    const flags = zipBuffer.readUInt16LE(offset + 8);
    const method = zipBuffer.readUInt16LE(offset + 10);
    const expectedCrc = zipBuffer.readUInt32LE(offset + 16);
    const compressedSize = zipBuffer.readUInt32LE(offset + 20);
    const uncompressedSize = zipBuffer.readUInt32LE(offset + 24);
    const nameLength = zipBuffer.readUInt16LE(offset + 28);
    const extraLength = zipBuffer.readUInt16LE(offset + 30);
    const commentLength = zipBuffer.readUInt16LE(offset + 32);
    const localOffset = zipBuffer.readUInt32LE(offset + 42);
    const centralEntrySize = 46 + nameLength + extraLength + commentLength;
    assertBufferRange(zipBuffer, offset, centralEntrySize, "central directory entry");
    const nameEncoding = (flags & 0x0800) === 0x0800 ? "utf8" : "latin1";
    const name = zipBuffer
      .subarray(offset + 46, offset + 46 + nameLength)
      .toString(nameEncoding);
    if (!name || names.has(name)) {
      throw new Error(`Invalid ZIP: duplicate or empty entry ${name || "<empty>"}.`);
    }
    names.add(name);

    assertBufferRange(zipBuffer, localOffset, 30, `local header for ${name}`);
    if (zipBuffer.readUInt32LE(localOffset) !== 0x04034b50) {
      throw new Error(`Invalid ZIP: malformed local header for ${name}.`);
    }
    const localNameLength = zipBuffer.readUInt16LE(localOffset + 26);
    const localExtraLength = zipBuffer.readUInt16LE(localOffset + 28);
    const dataOffset = localOffset + 30 + localNameLength + localExtraLength;
    assertBufferRange(zipBuffer, dataOffset, compressedSize, `compressed data for ${name}`);
    const compressedData = zipBuffer.subarray(
      dataOffset,
      dataOffset + compressedSize,
    );
    let data;
    if (method === 0) {
      data = Buffer.from(compressedData);
    } else if (method === 8) {
      data = inflateRawSync(compressedData);
    } else {
      throw new Error(`Unsupported ZIP compression method ${method} for ${name}.`);
    }
    if (data.length !== uncompressedSize || crc32(data) !== expectedCrc) {
      throw new Error(`ZIP integrity check failed for ${name}.`);
    }
    entries.push({ name: normalizeArchivePath(name), data });
    offset += centralEntrySize;
  }
  if (offset !== centralOffset + centralSize) {
    throw new Error("Invalid ZIP: central directory size does not match entries.");
  }
  return entries;
}

export function verifySubmissionEntries(entries) {
  const names = new Set();
  const violations = {
    pdf: [],
    nestedZip: [],
    environment: [],
    forbiddenDirectories: [],
    credentials: [],
    localPaths: [],
    secrets: [],
    notAllowlisted: [],
  };

  for (const entry of entries) {
    const name = normalizeArchivePath(entry.name);
    if (!name || names.has(name)) {
      violations.forbiddenDirectories.push(
        `${name || "<empty>"} (duplicate or empty path)`,
      );
      continue;
    }
    const forbiddenReason = findForbiddenArchivePathReason(name);
    if (forbiddenReason === "unsafe or absolute archive path") {
      violations.forbiddenDirectories.push(
        `${name} (${forbiddenReason})`,
      );
      continue;
    }
    names.add(name);
    const lowerName = name.toLowerCase();
    const segments = pathSegments(name);
    const basename = segments.at(-1) ?? "";
    if (lowerName.endsWith(".pdf")) {
      violations.pdf.push(name);
    }
    if (lowerName.endsWith(".zip")) {
      violations.nestedZip.push(name);
    }
    if (segments.some((segment) => segment.startsWith(".env"))) {
      violations.environment.push(name);
    }
    if (
      segments.some((segment) => FORBIDDEN_DIRECTORY_SEGMENTS.has(segment))
      || lowerName.startsWith("docs/sources/")
    ) {
      violations.forbiddenDirectories.push(name);
    }
    if (
      CREDENTIAL_FILENAMES.some((pattern) => pattern.test(basename))
      || [".crt", ".der", ".key", ".p12", ".pfx", ".pem"].includes(
        path.posix.extname(basename),
      )
    ) {
      violations.credentials.push(name);
    }
    if (!isAllowlistedProjectPath(name)) {
      violations.notAllowlisted.push(name);
    }
    const contentFindings = inspectTextContent(name, entry.data);
    for (const finding of contentFindings.localPaths) {
      violations.localPaths.push(`${name} (${finding.type}: ${finding.value})`);
    }
    for (const finding of contentFindings.secrets) {
      violations.secrets.push(
        `${name} (${finding.type}: ${finding.count} match${finding.count === 1 ? "" : "es"})`,
      );
    }
  }

  const missingRequired = [
    "package.json",
    "package-lock.json",
    "README.md",
    "AGENTS.md",
    "THIRD_PARTY_NOTICES.md",
    "docs/ASSET_MANIFEST.md",
    ...REQUIRED_SUBMISSION_DOCUMENTS,
    ...REQUIRED_RELEASE_CANDIDATE_DOCUMENTS,
  ].filter((required) => !names.has(required));
  if (![...names].some((name) => name.startsWith("src/"))) {
    missingRequired.push("src/**");
  }
  for (const screenshot of REQUIRED_SCREENSHOTS) {
    const requiredPath = `docs/submission-screenshots/${screenshot}`;
    if (!names.has(requiredPath)) {
      missingRequired.push(requiredPath);
    }
  }

  const violationCount = Object.values(violations)
    .reduce((sum, values) => sum + values.length, 0);
  return {
    ok: violationCount === 0 && missingRequired.length === 0,
    entryCount: names.size,
    pdfCount: violations.pdf.length,
    nestedZipCount: violations.nestedZip.length,
    secretCount: violations.secrets.length,
    localPathCount: violations.localPaths.length,
    forbiddenDirectoryCount: violations.forbiddenDirectories.length,
    environmentFileCount: violations.environment.length,
    credentialFileCount: violations.credentials.length,
    notAllowlistedCount: violations.notAllowlisted.length,
    missingRequired,
    violations,
  };
}

export function formatVerificationReport(report) {
  const lines = [
    `entries: ${report.entryCount}`,
    `PDF: ${report.pdfCount}`,
    `nested ZIP: ${report.nestedZipCount}`,
    `secret signatures: ${report.secretCount}`,
    `local user paths: ${report.localPathCount}`,
    `forbidden directories: ${report.forbiddenDirectoryCount}`,
    `environment files: ${report.environmentFileCount}`,
    `credential files: ${report.credentialFileCount}`,
    `not allowlisted: ${report.notAllowlistedCount}`,
    `missing required: ${report.missingRequired.length}`,
  ];
  if (report.missingRequired.length > 0) {
    lines.push(`  - ${report.missingRequired.join("\n  - ")}`);
  }
  for (const [category, values] of Object.entries(report.violations)) {
    if (values.length > 0) {
      lines.push(`${category}:`);
      lines.push(...values.map((value) => `  - ${value}`));
    }
  }
  return lines.join("\n");
}
