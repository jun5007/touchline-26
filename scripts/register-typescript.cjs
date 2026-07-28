/* eslint-disable @typescript-eslint/no-require-imports --
 * Node's synchronous `-r` loader hook is intentionally CommonJS. */
const fs = require("node:fs");
const moduleLoader = require("node:module");
const path = require("node:path");
const ts = require("typescript");

const projectSourceRoot = path.resolve(__dirname, "..", "src");
const originalResolveFilename = moduleLoader._resolveFilename;

moduleLoader._resolveFilename = function resolveProjectAlias(
  request,
  parent,
  isMain,
  options,
) {
  const normalizedRequest =
    typeof request === "string" && request.startsWith("@/")
      ? path.join(projectSourceRoot, request.slice(2))
      : request;
  return originalResolveFilename.call(
    this,
    normalizedRequest,
    parent,
    isMain,
    options,
  );
};

/**
 * Tiny local TypeScript loader for repository scripts. This keeps the
 * attribute audit command reproducible with the already-pinned `typescript`
 * devDependency, without adding another runtime package.
 */
require.extensions[".ts"] = function registerTypeScript(module, filename) {
  const source = fs.readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: {
      esModuleInterop: true,
      module: ts.ModuleKind.CommonJS,
      moduleResolution: ts.ModuleResolutionKind.NodeJs,
      target: ts.ScriptTarget.ES2020,
    },
    fileName: filename,
  });

  module._compile(output.outputText, filename);
};
