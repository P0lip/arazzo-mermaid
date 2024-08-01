export function parseSourceDescriptionExpression(
  expression: string,
): [name: string, resourceId: string] {
  if (!expression.startsWith("$sourceDescriptions.")) {
    throw new Error('Expected expression to start with "$sourceDescriptions."');
  }

  const [name, resourceId] = expression
    .slice("$sourceDescriptions.".length)
    .split(".");

  return [name, resourceId];
}

export function parseOperationPathExpression(
  expression: string,
): [name: string, resourceId: string, pointer: string | null] {
  const openCurlyBrace = expression.indexOf("{");
  const closeCurlyBrace = expression.indexOf("}");

  const slicedExpression = expression.slice(
    openCurlyBrace + 1,
    closeCurlyBrace === -1 ? expression.length : closeCurlyBrace,
  );
  const [name, resourceId] = parseSourceDescriptionExpression(slicedExpression);
  const pointer =
    closeCurlyBrace === -1 ? null : expression.slice(closeCurlyBrace + 1);

  return [name, resourceId, pointer];
}
