import { isPlainObject } from "@stoplight/json";
import { parseContent, readResource } from "../resources.js";
import {
  assertOpenAPISpecification,
  assertArazzoSpecification,
} from "./guards.js";
import { ArazzoSpecification } from "./objects/document.js";
import { OpenAPISpecification } from "../openapi/document.js";

function detectType(data: unknown): "openapi" | "arazzo" {
  if (!isPlainObject(data)) {
    throw new Error("Expected object");
  }

  return data["arazzo"] === void 0 ? "openapi" : "arazzo";
}

export async function linkArazzoSpecification(document: ArazzoSpecification) {
  let oasFiles = 0;

  for (const { name, url, type } of document.document.sourceDescriptions) {
    const [resource, baseUrl, contentType] = await readResource(
      document.baseUrl,
      url,
    );
    const parsedResource = parseContent(resource, contentType);

    let resolvedType = type;
    if (resolvedType === void 0) {
      resolvedType = detectType(parsedResource);
    }

    if (Object.hasOwn(document.sourceDescriptions.byName, name)) {
      throw new Error(`Document with name ${name} already exists`);
    }

    if (Object.hasOwn(document.state.allDocuments, url)) {
      document.sourceDescriptions.byUrl[url] =
        document.sourceDescriptions.byName[name] =
          document.state.allDocuments[url];
      continue;
    }

    document.state.allDocuments[url] = document;

    switch (type) {
      case "openapi": {
        oasFiles++;
        assertOpenAPISpecification(parsedResource);
        const openAPISpecification = new OpenAPISpecification(
          baseUrl,
          document.state,
          parsedResource,
        );

        if (oasFiles > 1) {
          // If multiple (non arazzo type) sourceDescriptions are defined, then the operationId MUST be specified using a runtime expression (e.g., $sourceDescriptions.<name>.<operationId>)
          document.sourceDescriptions.byOperationId = null;
        } else {
          document.sourceDescriptions.byOperationId =
            openAPISpecification.byOperationId;
        }

        document.sourceDescriptions.byName[name] = openAPISpecification;
        document.sourceDescriptions.byUrl[url] = openAPISpecification;
        return openAPISpecification.link();
      }

      case "arazzo": {
        assertArazzoSpecification(parsedResource);
        const newLinkedArazzoDocument = new ArazzoSpecification(
          baseUrl,
          document.state,
          parsedResource,
        );
        document.sourceDescriptions.byName[name] = newLinkedArazzoDocument;
        document.sourceDescriptions.byUrl[url] = newLinkedArazzoDocument;
        return newLinkedArazzoDocument.link();
      }
    }
  }
}
