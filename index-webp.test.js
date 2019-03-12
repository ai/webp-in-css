var delay = require('nanodelay')

global.Image = function () { }
global.Image.prototype = { }
Object.defineProperty(global.Image.prototype, 'src', {
  get: function () {
    return this._src
  },
  set: function (value) {
    var img = this
    img._src = value
    delay(1).then(function () {
      img.height = 1
      img.onload()
    })
  }
})

require('./index.src')

it('adds class to body', function () {
  return delay(100).then(function () {
    expect(document.body.className).toEqual('webp')
  })
})
