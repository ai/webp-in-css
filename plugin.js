const DEFAULT_OPTIONS = {
  modules: false,
  noWebpClass: 'no-webp',
  webpClass: 'webp',
  addNoJs: true,
  noJsClass: 'no-js',
  check: decl =>
    /\.(jpe?g|png)(?!(\.webp|.*[&?]format=webp))/i.test(decl.value),
  rename: oldName => oldName.replace(/\.(jpe?g|png)/gi, '.webp')
}

module.exports = (opts = {}) => {
  let { modules, noWebpClass, webpClass, addNoJs, noJsClass, rename, check } = {
    ...DEFAULT_OPTIONS,
    ...opts
  }

  function removeHtmlPrefix(className) {
    return className.replace(/html ?\./, '')
  }

  function addClass(selector, className) {
    let generatedNoJsClass
    let initialClassName = className
    if (className.includes('html')) {
      className = removeHtmlPrefix(className)
    }
    if (modules) {
      className = `:global(.${className})`
      generatedNoJsClass = `:global(.${noJsClass})`
    } else {
      className = `.${className}`
      generatedNoJsClass = `.${noJsClass}`
    }
    if (selector.includes('html')) {
      selector = selector.replace(/html[^ ]*/, `$& body${className}`)
    } else {
      selector = `body${className} ` + selector
    }
    if (addNoJs && initialClassName === noWebpClass) {
      selector +=
        ', ' +
        selector.split(`body${className}`).join(`body${generatedNoJsClass}`)
    }
    return selector
  }
  return {
    postcssPlugin: 'webp-in-css/plugin',
    Declaration(decl) {
      if (check(decl)) {
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
            i.prop = 'background-image'
          }
        })
        let noWebp = rule.cloneAfter()
        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        noWebp.selectors = noWebp.selectors.map(i => addClass(i, noWebpClass))
        noWebp.each(i => {
          i.prop = 'background-image'
        })
      }
    }
  }
}
module.exports.postcss = true
