const DEFAULT_OPTIONS = {
  modules: false,
  noWebpClass: 'no-webp',
  webpClass: 'webp',
  rename: oldName => {
    return oldName.replace(/\.(jpe?g|png)/gi, '.webp')
  }
}

module.exports = (opts = {}) => {
  let { modules, noWebpClass, webpClass, rename } = {
    ...DEFAULT_OPTIONS,
    ...opts
  }

  function removeHtmlPrefix (className) {
    return className.replace(/html ?\./, '')
  }

  function addClass (selector, className) {
    if (className.includes('html')) {
      className = removeHtmlPrefix(className)
    }
    if (modules) {
      className = `:global(.${className})`
    } else {
      className = `.${className}`
    }
    if (selector.includes('html')) {
      return selector.replace(/html[^ ]*/, `$& body${className}`)
    } else {
      return `body${className} ` + selector
    }
  }
  return {
    postcssPlugin: 'webp-in-css/plugin',
    Declaration (decl) {
      if (/\.(jpe?g|png)(?!(\.webp|.*[&?]format=webp))/i.test(decl.value)) {
        let rule = decl.parent
        if (rule.selector.includes(`.${removeHtmlPrefix(noWebpClass)}`)) return
        let webp = rule.cloneAfter()
        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        webp.selectors = webp.selectors.map(i => addClass(i, webpClass))
        webp.each(i => {
          if (
            rename &&
            Object.prototype.toString.call(rename) === '[object Function]'
          ) {
            i.value = rename(i.value)
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
    }
  }
}
module.exports.postcss = true
