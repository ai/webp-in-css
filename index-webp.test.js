let delay = require('nanodelay')

global.Image = function () { }
global.Image.prototype = { }
Object.defineProperty(global.Image.prototype, 'src', {
  get () {
    return this._src
  },
  set (value) {
    this._src = value
    delay(1).then(() => {
      this.height = 1
      this.onload()
    })
  }
})

require('./index')

it('adds class to body', () => {
  return delay(100).then(() => {
    expect(document.body.className).toEqual('webp')
  })
})
