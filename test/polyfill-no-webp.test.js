let { delay } = require('nanodelay')
let { test } = require('uvu')
let { equal } = require('uvu/assert')
require('./setup-body')

class BadImage {
  get src() {
    return this._src
  }

  set src(value) {
    this._src = value
    delay(1).then(() => {
      this.onerror()
    })
  }
}

test.before(() => {
  delete require.cache[require.resolve('../polyfill')]
  global.document.body.className = ''
  global.Image = BadImage
})

test('adds class to body', async () => {
  require('../polyfill')
  await delay(100)
  equal(document.body.className, 'no-webp')
})

test.run()
