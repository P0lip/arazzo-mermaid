import { Workflow } from "../arazzo/objects/workflow.js";
import type { ArazzoSpecification } from "../arazzo/objects/document.js";
import { OpenAPIOperation } from "../openapi/operation.js";
import type { Criterion } from "../arazzo/objects/criterion.js";
import type { SuccessAction } from "../arazzo/objects/action.js";

export function generateFlowChart(document: ArazzoSpecification) {
  return [
    "flowchart LR",
    ...Array.from(document.workflows.values()).map(
      generateFlowChartForWorkflow,
    ),
  ].join("\n");
}

function printName(displayName: string) {
  return `["${displayName.replaceAll('"', '\\"')}"]`;
}

function generateFlowChartForWorkflow(workflow: Workflow) {
  const lines = [`subgraph ${workflow.id} ${printName(workflow.displayName)}`];

  for (const dependantWorkflow of workflow.resolveDependsOn()) {
    lines.push(`${dependantWorkflow}`);
  }

  let needsEnd = true;
  for (const step of workflow.steps.values()) {
    if (lines.length > 1) {
      lines[lines.length - 1] += ` -->${step.id}`;
    }

    const resolvedObject = step.resolve();

    switch (true) {
      case resolvedObject instanceof Workflow:
        lines.push(`${workflow.id}-->${resolvedObject.id}`);
        break;
      case resolvedObject instanceof OpenAPIOperation:
        lines.push(`${step.id}[${step.formatRequest(resolvedObject)}]`);
        break;
    }

    attachSuccessCriteria(lines, step.id, step.successCriteria);

    needsEnd = step.successActions.length === 0;
    for (const successAction of step.successActions) {
      attachSuccessAction(lines, step.id, successAction);
    }
  }

  if (needsEnd) {
    lines[lines.length - 1] +=
      ` -->${workflow.state.identifiers.endIdentifier}`;
  }

  lines.push("end");

  for (let i = 0; i < lines.length; i++) {
    lines[i] = indent(lines[i], i === 0 || i === lines.length - 1 ? 2 : 4);
  }

  return lines.join("\n");
}

function indent(line: string, count: number) {
  return `${" ".repeat(count)}${line}`;
}

function attachSuccessCriteria(
  lines: string[],
  id: string,
  successCriteria: Criterion[],
) {
  const criterions: string[] = [];
  for (const criterion of successCriteria) {
    criterions.push(criterion.formatCriterion());
  }

  if (criterions.length > 0) {
    const conditions = JSON.stringify(`if ${criterions.join(" and ")}`);
    lines.push(`${id} -- ${conditions}`);
  } else {
    lines.push(`${id}`);
  }
}

function attachSuccessAction(
  lines: string[],
  id: string,
  successAction: SuccessAction,
) {
  if (successAction.object.type === "end") {
    lines.push(`${id} -->${successAction.state.identifiers.endIdentifier}`);
    return;
  }

  lines[lines.length - 1] += ` -->${successAction.id}`;

  attachSuccessCriteria(
    lines,
    `${successAction.id}["Success"]`,
    successAction.successCriteria,
  );

  lines[lines.length - 1] += ` -->${successAction.getWorkflowOrStepId()}`;
}
