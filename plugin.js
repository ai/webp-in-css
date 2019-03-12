let postcss = require('postcss')

module.exports = postcss.plugin('webp-css/plugin', () => {
  return root => {
    root.walkDecls(decl => {
      if (/\.(jpg|png)/i.test(decl.value)) {
        let rule = decl.parent
        if (rule.selector.indexOf('.no-webp') !== -1) return

        let webp = rule.cloneAfter()
        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        webp.selectors = webp.selectors.map(i => 'body.webp ' + i)
        webp.each(i => {
          i.value = i.value.replace(/\.(jpg|png)/ig, '.webp')
        })

        let noWebp = rule.cloneAfter()
        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        noWebp.selectors = noWebp.selectors.map(i => 'body.no-webp ' + i)

        decl.remove()
        if (rule.nodes.length === 0) rule.remove()
      }
    })
  }
})
