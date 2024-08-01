import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import $RefParser from "@stoplight/json-schema-ref-parser";
import { encodePointerUriFragment } from "@stoplight/json";
import type { State } from "../arazzo/state.js";
import { OpenAPIOperation } from "./operation.js";

export class OpenAPISpecification {
  constructor(
    readonly cwd: string,
    readonly state: State,
    readonly document: OpenAPIV3_1.Document | OpenAPIV3.Document,
  ) {
    this.document = document;
  }

  public byOperationPath: Record<string, OpenAPIOperation> = {};
  public byOperationId: Record<string, OpenAPIOperation> = {};

  async link(): Promise<void> {
    const bundled = (await $RefParser.bundle(
      this.cwd,
      this.document,
      {},
    )) as typeof this.document;

    for (const [path, pathItem] of Object.entries(bundled.paths ?? {})) {
      if (pathItem === void 0) {
        continue;
      }

      for (const verb of HTTP_VERBS) {
        const operationObject = pathItem[verb];
        if (operationObject === void 0) {
          continue;
        }

        const operation = new OpenAPIOperation(operationObject, verb, path);
        const pointer = `#/paths/${encodePointerUriFragment(path)}/${verb}`;
        this.byOperationPath[pointer] = operation;

        if (typeof operation.operationId === "string") {
          this.byOperationId[operation.operationId] = operation;
        }
      }
    }
  }
}

const HTTP_VERBS = [
  "get",
  "put",
  "post",
  "delete",
  "options",
  "head",
  "patch",
  "trace",
] as const;
