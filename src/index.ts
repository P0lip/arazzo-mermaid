import * as path from "@stoplight/path";

import { parseContent } from "./resources.js";
import { assertArazzoSpecification } from "./arazzo/guards.js";
import { ArazzoSpecification } from "./arazzo/objects/document.js";
import { State } from "./arazzo/state.js";
import { generateFlowChart } from "./mermaid/flowchart.js";

export default async function (content: string, filePath: string) {
  const data = parseContent(content, path.extname(filePath).slice(1));
  assertArazzoSpecification(data);
  const document = new ArazzoSpecification(filePath, new State(), data);
  await document.link();
  return generateFlowChart(document);
}
