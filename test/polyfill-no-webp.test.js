let { equal } = require('node:assert')
let { test } = require('node:test')
let { setTimeout } = require('node:timers/promises')
require('./setup-body')

class BadImage {
  get src() {
    return this._src
  }

  set src(value) {
    this._src = value
    setTimeout(1).then(() => {
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
  await setTimeout(100)
  equal(document.body.className, 'no-webp')
})
