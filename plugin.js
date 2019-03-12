var postcss = require('postcss')

module.exports = postcss.plugin('webp-css/plugin', function () {
  return function (root) {
    root.walkDecls(function (decl) {
      if (/\.(jpg|png)/i.test(decl.value)) {
        var rule = decl.parent
        if (rule.selector.indexOf('.no-webp') !== -1) return

        var webp = rule.cloneAfter()
        webp.each(function (i) {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        webp.selectors = webp.selectors.map(function (i) {
          return 'body.webp ' + i
        })
        webp.each(function (i) {
          i.value = i.value.replace(/\.(jpg|png)/ig, '.webp')
        })

        var noWebp = rule.cloneAfter()
        noWebp.each(function (i) {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        noWebp.selectors = noWebp.selectors.map(function (i) {
          return 'body.no-webp ' + i
        })

        decl.remove()
        if (rule.nodes.length === 0) rule.remove()
      }
    })
  }
})
