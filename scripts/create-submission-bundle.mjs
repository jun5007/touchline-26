import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import {
  BUNDLE_FILENAME,
  createZipBuffer,
  formatVerificationReport,
  loadProjectEntries,
  readZipEntries,
  verifySubmissionEntries,
} from "./submission-bundle-common.mjs";

const scriptDirectory = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(scriptDirectory, "..");
const outputPath = path.join(projectRoot, BUNDLE_FILENAME);

const entries = await loadProjectEntries(projectRoot);
const sourceReport = verifySubmissionEntries(entries);
if (!sourceReport.ok) {
  console.error("Submission bundle was not created. Allowlist validation failed.");
  console.error(formatVerificationReport(sourceReport));
  process.exitCode = 1;
} else {
  const zipBuffer = createZipBuffer(entries);
  const archiveReport = verifySubmissionEntries(readZipEntries(zipBuffer));
  if (!archiveReport.ok) {
    console.error("Submission bundle was not created. In-memory ZIP verification failed.");
    console.error(formatVerificationReport(archiveReport));
    process.exitCode = 1;
  } else {
    await writeFile(outputPath, zipBuffer);
    console.log(`Created: ${outputPath}`);
    console.log(`Size: ${zipBuffer.length} bytes`);
    console.log(formatVerificationReport(archiveReport));
  }
}
