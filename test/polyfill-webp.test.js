let { equal } = require('uvu/assert')
let { delay } = require('nanodelay')
let { test } = require('uvu')
require('./setup-body')

class GoodImage {
  get src() {
    return this._src
  }

  set src(value) {
    this._src = value
    delay(1).then(() => {
      this.height = 1
      this.onload()
    })
  }
}

test.before(() => {
  delete require.cache[require.resolve('../polyfill')]
  global.document.body.className = ''
  global.Image = GoodImage
})

test('adds class to body', async () => {
  require('../polyfill')
  await delay(100)
  equal(document.body.className, 'webp')
})

test.run()
