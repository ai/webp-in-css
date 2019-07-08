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
    'html.no-webp a, html.no-webp b { background: url(./image.jpg) } ' +
    'html.webp a, html.webp b { background: url(./image.webp) } ' +
    '}'
  )
})

it('removes empty rule', () => {
  run(
    'a,b { background: url(./image.PNG) }',
    'html.no-webp a,html.no-webp b { background: url(./image.PNG) }' +
    'html.webp a,html.webp b { background: url(./image.webp) }'
  )
})

it('does not dublicate html tag', () => {
  run(
    'html { background: url(./image.jpg) }',
    'html.no-webp { background: url(./image.jpg) }' +
    'html.webp { background: url(./image.webp) }'
  )
})

it('does not dublicate more complicated html tag', () => {
  run(
    'html[lang=en] { background: url(./image.jpg) }',
    'html[lang=en].no-webp { background: url(./image.jpg) }' +
    'html[lang=en].webp { background: url(./image.webp) }'
  )
})
