import { State } from "../state.js";
import type { CriterionObject, StepObject } from "../types.js";
import { Workflow } from "./workflow.js";
import type { OpenAPIOperation } from "../../openapi/operation.js";
import { Criterion } from "./criterion.js";
import { SuccessAction } from "./action.js";
import { isReusableObject } from "../guards.js";

export class Step {
  public readonly id: string;
  public readonly successCriteria: Criterion[] = [];
  public readonly successActions: SuccessAction[] = [];

  constructor(
    public readonly object: StepObject,
    public readonly state: State,
    public readonly parentWorkflow: Workflow,
  ) {
    this.id = state.identifiers.generateIdentifier();

    if (object.successCriteria) {
      this.#parseSuccessCriteria(object.successCriteria);
    }

    if (object.onSuccess) {
      this.#parseOnSuccess(object.onSuccess);
    }
  }

  public get stepId() {
    return this.object.stepId;
  }

  #parseSuccessCriteria(criteria: CriterionObject[]) {
    for (const object of criteria) {
      const criteria = new Criterion(object, this.state);
      this.successCriteria.push(criteria);
    }
  }

  #parseOnSuccess(onSuccess: NonNullable<StepObject["onSuccess"]>) {
    for (const object of onSuccess) {
      if (isReusableObject(object)) {
        console.warn("reusable objects not supported yet");
        continue;
      }

      this.successActions.push(new SuccessAction(object, this.state, this));
    }
  }

  public get displayName() {
    if (this.object.description?.length) {
      const index = this.object.description.indexOf("\n");
      return index === -1
        ? this.object.description
        : this.object.description.slice(0, index);
    }

    return this.object.stepId;
  }

  protected formatParameter(value: string): string {
    return value;
  }

  public formatRequest(operation: OpenAPIOperation): string {
    const params: Record<
      "query" | "cookie" | "header" | "path",
      Record<string, string>
    > = {
      query: {},
      header: {},
      cookie: {},
      path: {},
    };

    for (const parameter of this.object.parameters ?? []) {
      if (!("in" in parameter)) {
        console.warn("reusable objects not supported yet");
        continue;
      }

      params[parameter.in!][parameter.name] = this.formatParameter(
        parameter.value,
      );
    }

    const query = new URLSearchParams(params.query)
      .toString()
      .replace(/(^|=)%24inputs/g, "$1$inputs");
    const cookies = formatCookies(params.cookie);
    if (cookies.length > 0) {
      params.header["Cookie"] = cookies;
    }

    return [
      operation.method.toUpperCase(),
      " ",
      operation.path,
      query === "" ? "" : `?${query}`,
      formatHeaders(params.header),
    ]
      .filter(Boolean)
      .join("");
  }

  public resolve() {
    switch (true) {
      case "operationId" in this.object:
        return this.parentWorkflow.resolveOperationById(
          this.object.operationId,
        );
      case "operationPath" in this.object: {
        return this.parentWorkflow.resolveOperationByPath(
          this.object.operationPath!,
        );
      }
      case "workflowId" in this.object:
        return this.parentWorkflow.resolveWorkflow(this.object.workflowId!);
    }
  }
}

function formatCookies(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value)}`,
    )
    .join("; ");
}

function formatHeaders(headers: Record<string, string>): string {
  const arr = Object.entries(headers)
    .map(([key, value]) => `-H ${key}: ${value}`)
    .join("<br>");

  if (arr.length === 0) {
    return "";
  }

  return `<br>${arr}`;
}
