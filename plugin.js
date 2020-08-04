let postcss = require('postcss')

const DEFAULT_OPTIONS = {
  modules: false,
  noWebpClass: 'no-webp',
  webpClass: 'webp',
  overrideExtension: true
}

module.exports = postcss.plugin('webp-in-css/plugin', opts => {
  let { modules, noWebpClass, webpClass, overrideExtension } = {
    ...DEFAULT_OPTIONS,
    ...opts
  }

  function addClass (selector, className) {
    if (modules) {
      className = `:global(.${ className })`
    } else {
      className = `.${ className }`
    }
    if (selector.includes('html')) {
      return selector.replace(/html[^ ]*/, `$& body${ className }`)
    } else {
      return `body${ className } ` + selector
    }
  }

  return root => {
    root.walkDecls(decl => {
      if (/\.(jpg|png)(?!\.webp)/i.test(decl.value)) {
        let rule = decl.parent
        if (rule.selector.indexOf(`.${ noWebpClass }`) !== -1) return
        let webp = rule.cloneAfter()
        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        webp.selectors = webp.selectors.map(i => addClass(i, webpClass))
        webp.each(i => {
          if (overrideExtension) {
            i.value = i.value.replace(/\.(jpg|png)/gi, '.webp')
          } else {
            i.value = i.value.replace(/\.(jpg|png)/gi, '.$1.webp')
          }
        })
        let noWebp = rule.cloneAfter()
        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        noWebp.selectors = noWebp.selectors.map(i => addClass(i, noWebpClass))
        decl.remove()
        if (rule.nodes.length === 0) rule.remove()
      }
    })
  }
})
