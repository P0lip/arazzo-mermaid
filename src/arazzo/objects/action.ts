import type { CriterionObject, SuccessActionObject } from "../types.js";
import type { State } from "../state.js";
import { Criterion } from "./criterion.js";
import type { Step } from "./step.js";

export class SuccessAction {
  public readonly id: string;
  public readonly successCriteria: Criterion[] = [];

  constructor(
    public readonly object: SuccessActionObject,
    public readonly state: State,
    public readonly parentStep: Step,
  ) {
    this.id = state.identifiers.generateIdentifier();

    if (object.criteria) {
      this.#parseSuccessCriteria(object.criteria);
    }
  }

  public getWorkflowOrStepId(): string {
    if (this.object.stepId) {
      // todo: resolve step
      // return return this.parentStep.parentWorkflow.
      throw new Error("Not implemented");
    }

    return this.parentStep.parentWorkflow.resolveWorkflow(
      this.object.workflowId!,
    ).id;
  }

  #parseSuccessCriteria(criteria: CriterionObject[]) {
    for (const object of criteria) {
      const criteria = new Criterion(object, this.state);
      this.successCriteria.push(criteria);
    }
  }
}

export class FailureAction {}
