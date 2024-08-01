import type { OpenAPIV3, OpenAPIV3_1 } from "openapi-types";
import type { ArazzoSpecificationObject, ReusableObject } from "./types.js";
import { isPlainObject } from "@stoplight/json";

export function assertOpenAPISpecification(
  data: unknown,
): asserts data is OpenAPIV3.Document | OpenAPIV3_1.Document {
  // todo: implement me
}

export function assertArazzoSpecification(
  data: unknown,
): asserts data is ArazzoSpecificationObject {
  // todo: implement me
}

export function assertDefinedValue(
  value: unknown,
  message: string,
): asserts value {
  if (value === void 0) {
    throw new ReferenceError(message);
  }
}

export function isReusableObject(object: unknown): object is ReusableObject {
  return isPlainObject(object) && "reference" in object;
}
