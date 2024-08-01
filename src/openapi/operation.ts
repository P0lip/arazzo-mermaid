import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";

export class OpenAPIOperation {
  constructor(
    readonly object: OpenAPIV3.OperationObject | OpenAPIV3_1.OperationObject,
    readonly method: string,
    readonly path: string,
  ) {}

  get operationId(): string | undefined {
    return this.object.operationId;
  }
}
