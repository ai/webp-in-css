const selectorParser = require('postcss-selector-parser');

const DEFAULT_OPTIONS = {
  addNoJs: true,
  check: decl =>
    /\.(jpe?g|png)(?!(\.webp|.*[&?]format=webp))/i.test(decl.value),
  modules: false,
  noJsClass: 'no-js',
  noWebpClass: 'no-webp',
  rename: oldName => oldName.replace(/\.(jpe?g|png)/gi, '.webp'),
  webpClass: 'webp'
}

module.exports = (opts = {}) => {
  let { addNoJs, check, modules, noJsClass, noWebpClass, rename, webpClass } = {
    ...DEFAULT_OPTIONS,
    ...opts
  }

  function removeHtmlPrefix(className) {
    return className.replace(/html ?\./, '')
  }

  /**
   * Process background value to remove unnecessary parts
   * @param {string} value - background value
   */
  function processBackgroundValue(value) {
    // check for image-set
    // https://developer.mozilla.org/en-US/docs/Web/CSS/image/image-set
    let clearValue = 
      value.includes('image-set') ? 
      /(image-set.*\))/gm.exec(value) :
      /(url.*\))/gm.exec(value)

    if (!clearValue) {
      return value;
    }

    return clearValue[0] ?? value;
  }
  
  /**
   * Add .webp and .no-webp classes
   * @param {Rule} rule - PostCSS Rule
   * @param {string} className - class name to add
   */
  function addClass(rule, className) {
    let initialClassName = className
    let internalNoWebpClass = noWebpClass.includes('html') ? removeHtmlPrefix(noWebpClass) : noWebpClass
    if (className.includes('html')) {
      className = removeHtmlPrefix(className)
    }

    /**
     * @param {parser.Container} selectors
     * @param {string} targetClassName
     */
    let transformWithClass = (selectors, targetClassName) => {
      selectors.each(selector => {
        let isBodyFound = false
        let isHtmlFound = false

        // detect body & html, add class to body
        selector.walkTags(currentSelector => {
          if (currentSelector.value === 'body') {
            isBodyFound = true
            currentSelector.parent.insertAfter(currentSelector, selectorParser.className({value: targetClassName}))
          }
          else if (currentSelector.value === 'html') {
            isHtmlFound = true
          }
        })

        let bodyCombinator = selectorParser.combinator({value: ' '})
        let bodyTag = selectorParser.tag({value: 'body'})
        let bodyClass = selectorParser.className({value: targetClassName})

        // html found, no body tags
        if (isHtmlFound && !isBodyFound) {
          let isHtmlFoundHere = false
          selector.walk(currentSelector => {
            if (currentSelector.value === 'html') {
              isHtmlFoundHere = true
            }
            else if (isHtmlFoundHere && currentSelector.type === 'combinator') {
              let selectorParent = currentSelector.parent
              selectorParent.insertAfter(currentSelector, bodyTag)
              selectorParent.insertAfter(bodyTag, bodyClass)
              selectorParent.insertAfter(bodyClass, bodyCombinator)
            }
          })
        }
        else if (!isHtmlFound && !isBodyFound) {
          if (selector.first.spaces.before === ' ') {
            bodyTag.spaces.before = ' '
          }
          selector.first.spaces.before = ' '
          selector.prepend(bodyClass)
          selector.prepend(bodyTag)
        }
      })


      if (addNoJs && initialClassName === noWebpClass) {
        selectors.each(selector => {
          let selectorClone = selector.clone()
          selectorClone.walk(subSelector => {
            if (subSelector.type === 'class' && subSelector.value === internalNoWebpClass) {
              subSelector.value = noJsClass
            }
          })
          selectorClone.first.spaces.before = ' '
          selectors.insertAfter(selector, selectorClone)
        })
      }

      if (modules) {
        let validClass = [webpClass, internalNoWebpClass, noJsClass]
        selectors.each(selector => {
          selector.walk((subSelector) => {
            if (subSelector.type === 'class' && validClass.includes(subSelector.value)) {
              let newPseudo = selectorParser.pseudo({value: ':global(.' + subSelector.value + ')'})
              subSelector.replaceWith(newPseudo)
            }
          })
        })
      }
    }

    let transform = selectors => {
      transformWithClass(selectors, className)
    }

    return selectorParser(transform).processSync(rule.selector)
  }

  return {
    Declaration(decl) {
      if (check(decl)) {
        let rule = decl.parent
        if (rule.selector.includes(`.${removeHtmlPrefix(noWebpClass)}`)) return

        // check for image-set with types & skip processing
        if (decl.value.includes('image-set') && decl.value.includes(') type(')) return

        let webp = rule.cloneAfter()
        webp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        webp.selector = addClass(webp, webpClass)
        webp.each(i => {
          if (
            rename &&
            Object.prototype.toString.call(rename) === '[object Function]'
          ) {
            i.value = rename(i.value)
            i.prop = 'background-image'
          }
          i.value = processBackgroundValue(i.value)
        })
        let noWebp = rule.cloneAfter()
        noWebp.each(i => {
          if (i.prop !== decl.prop && i.value !== decl.value) i.remove()
        })
        noWebp.selector = addClass(noWebp, noWebpClass)
        noWebp.each(i => {
          i.value = processBackgroundValue(i.value)
          i.prop = 'background-image'
        })
      }
    },
    postcssPlugin: 'webp-in-css/plugin'
  }
}
module.exports.postcss = true
