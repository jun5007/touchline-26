/* eslint-disable @typescript-eslint/no-require-imports --
 * Node's synchronous `-r` loader hook is intentionally CommonJS. */
const fs = require("node:fs");
const ts = require("typescript");

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
