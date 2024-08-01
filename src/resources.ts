import {
  parseWithPointers as parseJsonWithPointers,
  type JsonParserResult,
} from "@stoplight/json";
import {
  parseWithPointers as parseYamlWithPointers,
  type YamlParserResult,
} from "@stoplight/yaml";
import * as path from "@stoplight/path";
import * as fs from "node:fs/promises";

export function parseContent(content: string, type: string): unknown {
  let parse:
    | ((value: string) => JsonParserResult<unknown>)
    | ((value: string) => YamlParserResult<unknown>);

  switch (type) {
    case "json":
      parse = parseJsonWithPointers;
      break;
    case "yaml":
    case "yml":
      parse = parseYamlWithPointers;
      break;
    default:
      throw new Error(`Unsupported type: ${type}`);
  }

  const { data, diagnostics } = parse(content);
  if (diagnostics.length > 0) {
    throw new Error(`Failed to parse content: ${diagnostics[0].message}`);
  }

  return data;
}

export async function readResource(
  baseUrl: string,
  url: string,
): Promise<[resource: string, baseUrl: string, type: string]> {
  if (path.isURL(url)) {
    const response = await fetch(url);
    const content = await response.text();
    let type;
    const contentType = response.headers.get("content-type");
    switch (contentType) {
      case "application/json":
      case "text/json":
        type = "json";
        break;
      case "application/yaml":
      case "text/yaml":
        type = "yaml";
        break;
      default:
        type = path.extname(url).slice(1);
    }

    return [content, url, type];
  }

  const resolvedUrl = path.isAbsolute(url)
    ? url
    : path.join(baseUrl, "..", url);
  const content = await fs.readFile(resolvedUrl, "utf8");
  return [content, url, path.extname(url).slice(1)];
}
