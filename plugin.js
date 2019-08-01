let postcss = require('postcss')

function addClass (selector, className, modules) {
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

const defaultOptions = {
  modules: false,
  noWebpClassName: 'no-webp',
  hasWebpClassName: 'webp'
}

module.exports = postcss.plugin('webp-in-css/plugin', userOptions => {
  let { modules, noWebpClassName, hasWebpClassName } = Object.assign(
    {},
    defaultOptions,
    userOptions
  )

  return root => {
    root.walkDecls(decl => {
      if (/\.(jpg|png)/i.test(decl.value)) {
        let rule = decl.parent

        if (rule.selector.indexOf(`.${ noWebpClassName }`) !== -1) return

        let webp = rule.cloneAfter()

        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })

        webp.selectors = webp.selectors.map(i =>
          addClass(i, hasWebpClassName, modules)
        )

        webp.each(i => {
          i.value = i.value.replace(/\.(jpg|png)/gi, '.webp')
        })

        let noWebp = rule.cloneAfter()

        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })

        noWebp.selectors = noWebp.selectors.map(i =>
          addClass(i, noWebpClassName, modules)
        )

        decl.remove()

        if (rule.nodes.length === 0) rule.remove()
      }
    })
  }
})
