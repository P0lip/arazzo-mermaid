import type { WorkflowObject, StepObject } from "../types.js";
import {
  parseOperationPathExpression,
  parseSourceDescriptionExpression,
} from "../evaluator.js";
import { State } from "../state.js";
import { ArazzoSpecification } from "./document.js";
import { Step } from "./step.js";
import { assertDefinedValue } from "../guards.js";
import { OpenAPI } from "openapi-types";
import Operation = OpenAPI.Operation;
import { OpenAPISpecification } from "../../openapi/document.js";

export class Workflow {
  readonly #workflow: WorkflowObject;

  public readonly steps: Map<string, Step> = new Map();
  public readonly id: string;

  constructor(
    workflow: WorkflowObject,
    readonly state: State,
    readonly parentSpec: ArazzoSpecification,
  ) {
    this.id = state.identifiers.generateIdentifier();
    this.#workflow = workflow;

    this.#parseSteps(workflow.steps);
  }

  #parseSteps(steps: StepObject[]) {
    for (const object of steps) {
      const step = new Step(object, this.state, this);
      this.steps.set(step.stepId, step);
    }
  }

  public get workflowId() {
    return this.#workflow.workflowId;
  }

  get description() {
    return this.#workflow.description;
  }

  get displayName() {
    return this.#workflow.summary ?? this.#workflow.workflowId;
  }

  public resolveOperationById(operationId: string): Operation {
    let resolvedOperation: Operation | undefined;

    if (operationId.startsWith("$sourceDescriptions")) {
      const [name, resourceId] = parseSourceDescriptionExpression(operationId);
      const resolvedDocument = this.parentSpec.sourceDescriptions.byName[name];
      assertDefinedValue(
        resolvedDocument,
        `Could not resolve source description: ${name}`,
      );
      if (!(resolvedDocument instanceof OpenAPISpecification)) {
        throw new TypeError(
          `Expected OpenAPISpecification, got ${resolvedDocument.constructor.name}`,
        );
      }

      resolvedOperation = resolvedDocument.byOperationId[resourceId];
    } else {
      resolvedOperation =
        this.parentSpec.sourceDescriptions.byOperationId?.[operationId];
    }

    assertDefinedValue(
      resolvedOperation,
      `Could not resolve operation: ${operationId}`,
    );
    return resolvedOperation;
  }

  public resolveOperationByPath(operationPath: string) {
    const [name, , pointer] = parseOperationPathExpression(operationPath);
    const resolvedDocument = this.parentSpec.sourceDescriptions.byName[name];
    assertDefinedValue(
      resolvedDocument,
      `Could not resolve source description: ${name}`,
    );
    if (!(resolvedDocument instanceof OpenAPISpecification)) {
      throw new TypeError(
        `Expected OpenAPISpecification, got ${resolvedDocument.constructor.name}`,
      );
    }

    assertDefinedValue(
      pointer,
      `Could not resolve operation: ${operationPath}`,
    );

    const resolvedOperation = resolvedDocument.byOperationPath[pointer];
    assertDefinedValue(
      resolvedOperation,
      `Could not resolve operation: ${operationPath}`,
    );
    return resolvedOperation;
  }

  public resolveWorkflow(workflowId: string) {
    let resolvedWorkflow: Workflow | undefined;

    if (workflowId.startsWith("$sourceDescriptions")) {
      const [name, resourceId] = parseSourceDescriptionExpression(workflowId);
      const resolvedDocument = this.parentSpec.sourceDescriptions.byName[name];
      assertDefinedValue(
        resolvedDocument,
        `Could not resolve source description: ${name}`,
      );
      if (!(resolvedDocument instanceof ArazzoSpecification)) {
        throw new TypeError(
          `Expected ArazzoSpecification, got ${resolvedDocument.constructor.name}`,
        );
      }

      resolvedWorkflow = resolvedDocument.workflows.get(resourceId);
    } else {
      resolvedWorkflow = this.parentSpec.workflows.get(workflowId);
    }

    assertDefinedValue(
      resolvedWorkflow,
      `Could not resolve workflow: ${workflowId}`,
    );
    return resolvedWorkflow;
  }

  public resolveDependsOn(): Set<string> {
    const ids = new Set<string>();

    if (!Array.isArray(this.#workflow.dependsOn)) {
      return ids;
    }

    for (const dependency of this.#workflow.dependsOn) {
      const resolvedWorkflow = this.resolveWorkflow(dependency);
      ids.add(resolvedWorkflow.id);
    }

    return ids;
  }
}
