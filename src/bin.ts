import * as fs from "node:fs/promises";
import { parseArgs } from "node:util";
import * as process from "node:process";
import * as assert from "node:assert/strict";
import * as stoplightPath from "@stoplight/path";
import * as path from "node:path";

import generateFlowChart from "./index.js";

const { values, positionals } = parseArgs({
  args: process.argv.slice(2),
  allowPositionals: true,
  options: {
    output: { type: "string", alias: "o" },
  },
});

assert.ok(positionals.length === 1, "Expected exactly one input is required");

const [input] = positionals;

const resolvedInput = stoplightPath.isURL(input)
  ? input
  : path.isAbsolute(input)
    ? input
    : path.join(process.cwd(), input);

generateFlowChart(await fs.readFile(resolvedInput, "utf8"), resolvedInput)
  .then((flowchart) => {
    return fs.writeFile(values.output ?? `${Date.now()}.mermaid`, flowchart);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
