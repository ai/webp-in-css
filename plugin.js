let postcss = require('postcss')

function addClass (selector, className) {
  if (selector.includes('html')) {
    return selector.replace(/html[^ ]*/, `$&.${ className }`)
  } else {
    return `html.${ className } ` + selector
  }
}

module.exports = postcss.plugin('webp-in-css/plugin', () => {
  return root => {
    root.walkDecls(decl => {
      if (/\.(jpg|png)/i.test(decl.value)) {
        let rule = decl.parent
        if (rule.selector.indexOf('.no-webp') !== -1) return

        let webp = rule.cloneAfter()
        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        webp.selectors = webp.selectors.map(i => addClass(i, 'webp'))

        webp.each(i => {
          i.value = i.value.replace(/\.(jpg|png)/gi, '.webp')
        })

        let noWebp = rule.cloneAfter()
        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        noWebp.selectors = noWebp.selectors.map(i => addClass(i, 'no-webp'))

        decl.remove()
        if (rule.nodes.length === 0) rule.remove()
      }
    })
  }
})
