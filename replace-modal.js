export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root
    .find(j.ExpressionStatement)
    .filter(path => {
      const expr = path.node.expression;
      return (
        expr.type === 'CallExpression' &&
        expr.callee.type === 'MemberExpression' &&
        expr.callee.property.name === 'modal' &&
        expr.callee.object.type === 'CallExpression' &&
        expr.callee.object.callee.name === '$' &&
        expr.callee.object.arguments.length === 1 &&
        expr.callee.object.arguments[0].type === 'Literal' &&
        typeof expr.callee.object.arguments[0].value === 'string' &&
        expr.callee.object.arguments[0].value.startsWith('#')
      );
    })
    .replaceWith(path => {
      const callExpr = path.node.expression;
      // Selector literal, e.g. '#modalvideo'
      const selectorLiteral = callExpr.callee.object.arguments[0];
      const idValue = selectorLiteral.value.slice(1); // remove '#'

      // document.getElementById('modalvideo')
      const getEl = j.callExpression(
        j.memberExpression(j.identifier('document'), j.identifier('getElementById')),
        [j.literal(idValue)]
      );

      // Options object passed to .modal(...)
      const optionsArg = callExpr.arguments[0] || j.objectExpression([]);

      // new bootstrap.Modal(document.getElementById('modalvideo'), {...})
      const newExpr = j.newExpression(
        j.memberExpression(j.identifier('bootstrap'), j.identifier('Modal')),
        [getEl, optionsArg]
      );

      // const bootstrapModal = new bootstrap.Modal(...);
      return j.variableDeclaration('const', [
        j.variableDeclarator(j.identifier('bootstrapModal'), newExpr)
      ]);
    });

  return root.toSource({ quote: 'double' });
}
