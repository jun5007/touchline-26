import assert from "node:assert/strict";
import test from "node:test";

import {
  REQUIRED_SCREENSHOTS,
  crc32,
  createZipBuffer,
  inspectTextContent,
  readZipEntries,
  verifySubmissionEntries,
} from "./submission-bundle-common.mjs";

function minimalValidEntries() {
  const entries = [
    { name: "package.json", data: "{}" },
    { name: "package-lock.json", data: "{}" },
    { name: "README.md", data: "# TOUCHLINE 26" },
    { name: "AGENTS.md", data: "# Instructions" },
    { name: "THIRD_PARTY_NOTICES.md", data: "# Notices" },
    { name: "SUBMISSION_FINAL_SUMMARY.md", data: "# Summary" },
    { name: "SUBMISSION_TEST_RESULTS.md", data: "# Tests" },
    { name: "SUBMISSION_KNOWN_ISSUES.md", data: "# Issues" },
    { name: "SUBMISSION_RELEASE_CHECKLIST.md", data: "# Release" },
    { name: "FINAL_RELEASE_FILE_LIST.md", data: "# Release files" },
    { name: "RELEASE_CANDIDATE_SUMMARY.md", data: "# RC summary" },
    { name: "RELEASE_CANDIDATE_TEST_RESULTS.md", data: "# RC tests" },
    { name: "RELEASE_CANDIDATE_KNOWN_ISSUES.md", data: "# RC issues" },
    { name: "RELEASE_CANDIDATE_CHANGED_FILES.md", data: "# RC changes" },
    { name: "docs/ASSET_MANIFEST.md", data: "# Asset manifest" },
    { name: "src/app/page.tsx", data: "export default function Page() {}" },
  ];
  for (const screenshot of REQUIRED_SCREENSHOTS) {
    entries.push({
      name: `docs/submission-screenshots/${screenshot}`,
      data: Buffer.from([0x89, 0x50, 0x4e, 0x47]),
    });
  }
  return entries;
}

test("CRC-32 matches the standard check value", () => {
  assert.equal(crc32("123456789"), 0xcbf43926);
});

test("ZIP encoder and reader round-trip UTF-8 paths and bytes", () => {
  const source = [
    { name: "src/한국어.ts", data: Buffer.from("export const value = 26;") },
    { name: "README.md", data: Buffer.from("# TOUCHLINE 26") },
  ];
  const parsed = readZipEntries(createZipBuffer(source));
  assert.deepEqual(
    parsed.map((entry) => [entry.name, entry.data.toString("utf8")]),
    source.map((entry) => [entry.name, entry.data.toString("utf8")]),
  );
});

test("submission verifier requires source, final documents, and all screenshots", () => {
  const report = verifySubmissionEntries(minimalValidEntries());
  assert.equal(report.ok, true);
  assert.equal(report.entryCount, 31);
});

test("text inspection detects a user directory and high-confidence token", () => {
  const localPath = ["C:", "Users", "reviewer", "project"].join("/");
  const accessKey = `AKIA${"A".repeat(16)}`;
  const report = inspectTextContent(
    "docs/check.md",
    `path=${localPath}\nkey=${accessKey}`,
  );
  assert.equal(report.localPaths.length, 1);
  assert.equal(report.secrets.length, 1);
});

test("text inspection detects arbitrary Windows drive and UNC paths", () => {
  const drivePath = ["D:", "work", "touchline26"].join("\\");
  const uncPath = ["", "", "review-server", "share", "bundle"].join("\\");
  const report = inspectTextContent(
    "docs/check.md",
    `drive=${drivePath}\nunc=${uncPath}`,
  );
  assert.equal(report.localPaths.length, 2);
});

test("submission verifier rejects nested archives and forbidden directories", () => {
  const report = verifySubmissionEntries([
    ...minimalValidEntries(),
    { name: "docs/archive.zip", data: "not a zip" },
    { name: "src/tmp/debug.ts", data: "export {}" },
  ]);
  assert.equal(report.ok, false);
  assert.equal(report.nestedZipCount, 1);
  assert.equal(report.forbiddenDirectoryCount, 1);
});

test("submission verifier rejects traversal, absolute, NUL, and source-material paths", () => {
  const unsafeNames = [
    "src/../README.md",
    "/src/app/page.tsx",
    ["C:", "src", "app", "page.tsx"].join("/"),
    "src/app/page.tsx\0.txt",
    "docs/sources/other/raw.json",
  ];
  for (const name of unsafeNames) {
    const report = verifySubmissionEntries([
      ...minimalValidEntries(),
      { name, data: "unsafe" },
    ]);
    assert.equal(report.ok, false, name);
    assert.equal(report.forbiddenDirectoryCount, 1, name);
  }
});

test("submission verifier excludes the frozen Python app and stale captures", () => {
  const report = verifySubmissionEntries([
    ...minimalValidEntries(),
    { name: "python-fastapi/app/main.py", data: "print('legacy')" },
    {
      name: "docs/final-review-screenshots/CAPTURE_STATUS.md",
      data: "stale",
    },
  ]);
  assert.equal(report.ok, false);
  assert.equal(report.notAllowlistedCount, 2);
});
