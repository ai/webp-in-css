
let delay = require('nanodelay')

global.Image = function () { }
global.Image.prototype = { }
Object.defineProperty(global.Image.prototype, 'src', {
  get () {
    return this._src
  },
  async set (value) {
    this._src = value
    await delay(1)
    this.onerror()
  }
})

require('../index')

it('adds class to body', async () => {
  await delay(100)
  expect(document.body.className).toEqual('no-webp')
})
