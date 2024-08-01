import { ArazzoSpecificationObject } from "../types.js";
import { Workflow } from "./workflow.js";
import { State } from "../state.js";
import { OpenAPISpecification } from "../../openapi/document.js";
import { linkArazzoSpecification } from "../linker.js";

export class ArazzoSpecification {
  public workflows = new Map<string, Workflow>();

  public readonly sourceDescriptions: {
    byOperationId: OpenAPISpecification["byOperationId"] | null;
    byName: Record<string, OpenAPISpecification | ArazzoSpecification>;
    byUrl: Record<string, OpenAPISpecification | ArazzoSpecification>;
  } = {
    byOperationId: {},
    byName: {},
    byUrl: {},
  };

  getWorkflow(id: string) {
    return this.workflows.get(id);
  }

  constructor(
    readonly baseUrl: string,
    readonly state: State,
    readonly document: ArazzoSpecificationObject,
  ) {}

  public link(): Promise<void> {
    for (const workflowObject of this.document.workflows) {
      if (this.workflows.has(workflowObject.workflowId)) {
        throw new Error(`Duplicate workflow ID: ${workflowObject.workflowId}`);
      }

      const workflow = new Workflow(workflowObject, this.state, this);
      this.workflows.set(workflow.workflowId, workflow);
    }

    return linkArazzoSpecification(this);
  }
}
