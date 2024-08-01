export type ArazzoSpecificationObject = {
  arazzo: string;
  info: InfoObject;
  sourceDescriptions: SourceDescriptionObject[];
  workflows: WorkflowObject[];
  components?: ComponentsObject;
};

type InfoObject = {
  title: string;
  summary: string;
  description: string;
  version: string;
};

type SourceDescriptionObject = {
  name: string;
  url: string;
  type?: "openapi" | "arazzo";
};

type JSONSchema = Record<string, unknown>;

export type RuntimeExpression =
  | `$url`
  | `$method`
  | `$statusCode`
  | `$request.${ExpressionSource}`
  | `$response.${ExpressionSource}`
  | `$message.${ExpressionSource}`
  | `$inputs.${ExpressionName}`
  | `$outputs.${ExpressionName}`
  | `$steps.${ExpressionName}`
  | `$workflows.${ExpressionName}`
  | `$sourceDescriptions.${ExpressionName}`
  | `$components.parameters.${ParameterName}`
  | `$components.${string}`;
type ExpressionSource =
  | ExpressionHeaderReference
  | ExpressionQueryReference
  | ExpressionPathReference
  | ExpressionBodyReference;

type ExpressionHeaderReference = `header.${string}`;
type ExpressionQueryReference = `query.${string}`;
type ExpressionPathReference = `path.${string}`;
type ExpressionBodyReference = `body.${string}`;

type ParameterName = string;
type ExpressionName = string;

export type WorkflowObject = {
  workflowId: string;
  summary?: string;
  description?: string;
  inputs?: JSONSchema;
  dependsOn?: string[];
  steps: StepObject[];
  successActions?: (SuccessActionObject | ReusableObject)[];
  failureActions?: (FailureActionObject | ReusableObject)[];
  outputs?: Record<string, RuntimeExpression>;
  parameters?: (ParameterObject | ReusableObject)[];
};

export type StepObject = {
  description?: string;
  stepId: string;
  parameters?: (ParameterObject | ReusableObject)[];
  // requestBody?: RequestBodyObject;
  successCriteria?: CriterionObject[];
  onSuccess?: (SuccessActionObject | ReusableObject)[];
  onFailure?: (FailureActionObject | ReusableObject)[];
  outputs?: Record<string, RuntimeExpression>;
} & (
  | {
      operationId: string;
    }
  | {
      operationPath: string;
    }
  | {
      workflowId?: string;
    }
);

type ParameterObject = {
  name: string;
  in?: "header" | "query" | "path" | "cookie";
  value: string | RuntimeExpression;
};

export type SuccessActionObject = {
  name: string;
  type: "end" | "goto";
  workflowId?: string;
  stepId?: string;
  criteria?: CriterionObject[];
};

type FailureActionObject = {
  name: string;
  workflowId?: string;
  stepId?: string;
  criteria?: CriterionObject[];
} & (
  | {
      type: "retry";
      retryAfter?: number;
      retryLimit?: number;
    }
  | {
      type: "end" | "goto";
    }
);

export type CriterionObject = {
  context?: string;
  condition: string;
  type?: "simple" | "regex" | "jsonpath" | "xpath";
};

export type ReusableObject = {
  reference: RuntimeExpression;
  value?: string;
};

type ComponentsObject = {
  inputs?: Record<string, JSONSchema>;
  parameters?: Record<string, JSONSchema>;
  successActions?: Record<string, SuccessActionObject>;
  failureActions?: Record<string, FailureActionObject>;
};
