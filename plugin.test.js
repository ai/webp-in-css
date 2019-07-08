let postcss = require('postcss')

let plugin = require('./plugin')

function run (input, output) {
  expect(postcss([plugin]).process(input).css).toEqual(output)
}

it('adds classes and WebP link', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
    'a, b { color: black } ' +
    'body.no-webp a, body.no-webp b { background: url(./image.jpg) } ' +
    'body.webp a, body.webp b { background: url(./image.webp) } ' +
    '}'
  )
})

it('removes empty rule', () => {
  run(
    'a,b { background: url(./image.PNG) }',
    'body.no-webp a,body.no-webp b { background: url(./image.PNG) }' +
    'body.webp a,body.webp b { background: url(./image.webp) }'
  )
})

it('does not dublicate html tag', () => {
  run(
    'html[lang=en] .icon { background: url(./image.jpg) }',
    'html[lang=en] body.no-webp .icon { background: url(./image.jpg) }' +
    'html[lang=en] body.webp .icon { background: url(./image.webp) }'
  )
})
