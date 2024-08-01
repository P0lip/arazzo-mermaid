import type { CriterionObject } from "../types.js";
import type { State } from "../state.js";

export class Criterion {
  constructor(
    public readonly object: CriterionObject,
    public readonly state: State,
  ) {}

  public formatCriterion(): string {
    switch (this.object.type) {
      case "simple":
        return this.object.condition;
      case "regex":
        return `${this.object.context} matches ${this.object.condition}`;
      default:
        return this.object.condition;
    }
  }
}
