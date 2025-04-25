export default function transformer(file, api,options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  const targetId = options.id
  if (typeof targetId !== 'string') {
    throw new Error('Debe pasarse --id al transform de jscodeshift');
  }

  root
    .find(j.ExpressionStatement)
    .filter(path => {
      const expr = path.node.expression;
      return (
        expr.type === "CallExpression" &&
        expr.callee.type === "MemberExpression" &&
        expr.callee.property.name === "datetimepicker" &&
        expr.callee.object.type === "CallExpression" &&
        expr.callee.object.callee.name === "$" &&
        expr.callee.object.arguments.length === 1 &&
        expr.callee.object.arguments[0].value === targetId
      );
    })
    .replaceWith(() => {
      // document.getElementById('targetId')
      const getEl = j.callExpression(
        j.memberExpression(j.identifier("document"), j.identifier("getElementById")),
        [ j.literal(targetId) ]
      );

      // Construcción del objeto de opciones
      const optionsObj = j.objectExpression([
        j.property("init", j.identifier("display"),
          j.objectExpression([
            j.property("init", j.identifier("components"),
              j.objectExpression([
                j.property("init", j.identifier("calendar"), j.literal(true)),
                j.property("init", j.identifier("date"),     j.literal(true)),
                j.property("init", j.identifier("month"),    j.literal(true)),
                j.property("init", j.identifier("year"),     j.literal(true)),
                j.property("init", j.identifier("decades"),  j.literal(true)),
                j.property("init", j.identifier("clock"),    j.literal(true)),
                j.property("init", j.identifier("hours"),    j.literal(true)),
                j.property("init", j.identifier("minutes"),  j.literal(true)),
                j.property("init", j.identifier("seconds"),  j.literal(false)),
              ])
            ),
            j.property("init", j.identifier("sideBySide"), j.literal(true)),
          ])
        ),
        j.property("init", j.identifier("restrictions"),
          j.objectExpression([
            j.property("init", j.identifier("minDate"),
              j.newExpression(j.identifier("Date"), [ j.identifier("hoyVenc") ])
            ),
            j.property("init", j.identifier("maxDate"),
              j.newExpression(j.identifier("Date"), [ j.identifier("fechaMaxima") ])
            ),
            j.property("init", j.identifier("disabledDates"),
              j.arrayExpression([
                j.arrayExpression([
                  j.newExpression(j.identifier("Date"), [ j.identifier("hoyVenc") ]),
                  j.newExpression(j.identifier("Date"), [ j.identifier("Date") ])
                ])
              ])
            )
          ])
        ),
        j.property("init", j.identifier("localization"),
          j.objectExpression([
            j.property("init", j.identifier("locale"), j.literal("es"))
          ])
        )
      ]);

      // Sustituimos por: new TempusDominus(getEl, optionsObj);
      return j.expressionStatement(
        j.newExpression(
          j.identifier("TempusDominus"),
          [ getEl, optionsObj ]
        )
      );
    });

  return root.toSource({ quote: "double" });
}
