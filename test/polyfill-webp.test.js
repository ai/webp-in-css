let { equal } = require('node:assert')
let { test } = require('node:test')
let { setTimeout } = require('node:timers/promises')
require('./setup-body')

class GoodImage {
  get src() {
    return this._src
  }

  set src(value) {
    this._src = value
    setTimeout(1).then(() => {
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
  await setTimeout(100)
  equal(document.body.className, 'webp')
})

test.run()
