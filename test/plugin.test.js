let postcss = require('postcss')

let plugin = require('../plugin')

function run (input, output, options) {
  expect(postcss([plugin(options)]).process(input).css).toBe(output)
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

describe('options', () => {
  it('should add :global() scope when css modules enabled', () => {
    run(
      'a { background: url(./image.png) }',
      'body:global(.no-webp) a { background: url(./image.png) }' +
        'body:global(.webp) a { background: url(./image.webp) }',
      { modules: true }
    )
  })

  it('should use passed classNames', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      { noWebpClass: 'without-webp', webpClass: 'has-webp' }
    )
  })

  it('set rename function', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.no-webp .c { background: url(./image.png) }' +
        'body.webp .c { background: url(./image.png.webp) }',
      {
        rename: oldName => {
          return oldName.replace(/\.(jpg|png)/gi, '.$1.webp')
        }
      }
    )
  })
})
