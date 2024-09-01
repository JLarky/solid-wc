#!/usr/bin/env -S deno run --allow-read --allow-write --allow-net --allow-env --allow-run
// Copyright 2018-2022 the oak authors. All rights reserved. MIT license.

/**
 * This is the build script for building npm package.
 *
 * @module
 */

import { build, emptyDir } from "@deno/dnt";

async function start() {
  await emptyDir("./npm");

  await build({
    entryPoints: ["./mod.ts"],
    outDir: "./npm",
    shims: {},
    test: false,
    typeCheck: "both",
    compilerOptions: {
      importHelpers: false,
      sourceMap: true,
      target: "ES2021",
      lib: ["ESNext", "DOM", "DOM.Iterable"],
    },
    package: {
      name: "solid-wc",
      version: Deno.args[0],
      description: "Write web components with SolidJS.",
      license: "MIT",
      keywords: ["solid", "solidjs", "web-components", "wc"],
      engines: {
        node: ">=8.0.0",
      },
      repository: {
        type: "git",
        url: "git+https://github.com/JLarky/solid-wc.git",
      },
      bugs: {
        url: "https://github.com/JLarky/solid-wc/issues",
      },
      dependencies: {},
      devDependencies: {},
    },
  });

  await Deno.copyFile("LICENSE", "npm/LICENSE");
  await Deno.copyFile("README.md", "npm/README.md");
}

start();
