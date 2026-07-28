import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLE_FILENAME,
  formatVerificationReport,
  readZipEntries,
  verifySubmissionEntries,
} from "./submission-bundle-common.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const requestedPath = process.argv[2]
  ? path.resolve(projectRoot, process.argv[2])
  : path.join(projectRoot, BUNDLE_FILENAME);

try {
  const archive = await readFile(requestedPath);
  const report = verifySubmissionEntries(readZipEntries(archive));
  console.log(`Verified: ${requestedPath}`);
  console.log(formatVerificationReport(report));
  if (!report.ok) {
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`Bundle verification failed: ${requestedPath}`);
  console.error(error instanceof Error ? error.message : error);
  process.exitCode = 1;
}
