export default function transformer(file, api) {
  const j = api.jscodeshift;
  const root = j(file.source);

  // 1) Buscamos todas las llamadas de la forma $("#...").DataTable({...})
  root
    .find(j.CallExpression, {
      callee: {
        type: 'MemberExpression',
        property: { type: 'Identifier', name: 'DataTable' }
      }
    })
    .forEach(path => {
      // 2) Tomamos el objeto de configuración (primer arg)
      const args = path.node.arguments;
      if (args.length === 0) return;
      const config = args[0];
      if (config.type !== 'ObjectExpression') return;

      // 3) Localizamos índice de la propiedad 'dom'
      const idxDom = config.properties.findIndex(prop =>
        prop.key &&
        prop.key.type === 'Identifier' &&
        prop.key.name === 'dom' &&
        prop.value.type === 'Literal'
      );

      // Si no hay dom, o está vacío, salimos
      if (idxDom < 0) return;
      const domProp = config.properties[idxDom];
      if (domProp.value.value === '') {
        return;
      }

      // 4) Creamos layoutProperty
      const layoutProp = j.property(
        'init',
        j.identifier('layout'),
        j.objectExpression([
          j.property('init', j.identifier('topStart'), j.literal(null)),
          j.property('init', j.identifier('top'), j.arrayExpression([
            j.objectExpression([
              j.property('init', j.identifier('id'), j.literal('miInfo')),
              j.property('init', j.identifier('className'),
                         j.literal('d-flex w-100 justify-content-between me-1 ms-1')),
              j.property('init', j.identifier('features'),
                         j.arrayExpression([ j.literal('info') ]))
            ]),
            j.literal('paging'),
            j.literal('pageLength')
          ])),
          j.property('init', j.identifier('bottomStart'), j.literal(null)),
          j.property('init', j.identifier('bottomEnd'), j.literal(null)),
          j.property('init', j.identifier('bottom'), j.arrayExpression([
            j.objectExpression([
              j.property('init', j.identifier('id'), j.literal('miInfo')),
              j.property('init', j.identifier('className'),
                         j.literal('d-flex w-100 justify-content-between me-1 ms-1')),
              j.property('init', j.identifier('features'),
                         j.arrayExpression([ j.literal('info') ]))
            ]),
            j.literal('paging'),
            j.objectExpression([
              j.property('init', j.identifier('div'),
                j.objectExpression([
                  j.property('init', j.identifier('className'),
                             j.literal('layout-full')),
                  j.property('init', j.identifier('html'),
                             j.literal('<div id="divAncla"></div>'))
                ])
              )
            ])
          ]))
        ])
      );

      // 5) Reemplazamos dom por layout
      //    eliminamos la prop dom...
      config.properties.splice(idxDom, 1);
      //    ...y añadimos layout al final
      config.properties.push(layoutProp);
    });

  return root.toSource({ quote: 'double' });
}
