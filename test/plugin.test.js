let { equal } = require('uvu/assert')
let postcss = require('postcss')
let { test } = require('uvu')

let plugin = require('../plugin')

function run(input, output, options) {
  equal(postcss([plugin(options)]).process(input).css, output)
}

test('adds classes and WebP link', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
      'a, b { color: black; background: url(./image.jpg) } ' +
      'body.no-webp a, body.no-webp b { background-image: url(./image.jpg) } ' +
      'body.webp a, body.webp b { background-image: url(./image.webp) } ' +
      '}',
    { addNoJs: false }
  )
})

test('should work with jpeg', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg) } }',
    '@media screen { ' +
      'a, b { color: black; background: url(./image.jpeg) } ' +
      'body.no-webp a, body.no-webp b { background-image: url(./image.jpeg) } ' +
      'body.webp a, body.webp b { background-image: url(./image.webp) } ' +
      '}',
    { addNoJs: false }
  )
})

test('should skip urls with [&?]format=webp', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }',
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }',
    { addNoJs: false }
  )
})

// test('removes empty rule', () => {
//   run(
//     'a,b { background: url(./image.PNG) }',
//     'body.no-webp a,body.no-webp b { background: url(./image.PNG) }' +
//       'body.webp a,body.webp b { background: url(./image.webp) }',
//     { addNoJs: false }
//   )
// })

test('does not duplicate html tag', () => {
  run(
    'html[lang=en] .icon { background: url(./image.jpg) }',
    'html[lang=en] .icon { background: url(./image.jpg) }' +
      'html[lang=en] body.no-webp .icon { background-image: url(./image.jpg) }' +
      'html[lang=en] body.webp .icon { background-image: url(./image.webp) }',
    { addNoJs: false }
  )
})

test('should add :global() scope when css modules enabled', () => {
  run(
    'a { background: url(./image.png) }',
    'a { background: url(./image.png) }' +
      'body:global(.no-webp) a { background-image: url(./image.png) }' +
      'body:global(.webp) a { background-image: url(./image.webp) }',
    { modules: true, addNoJs: false }
  )
})

test('should use passed classNames', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.without-webp .c { background-image: url(./image.png) }' +
      'body.has-webp .c { background-image: url(./image.webp) }',
    { noWebpClass: 'without-webp', webpClass: 'has-webp', addNoJs: false }
  )
})

test('should replace passed class with html tag v1', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.without-webp .c { background-image: url(./image.png) }' +
      'body.has-webp .c { background-image: url(./image.webp) }',
    {
      noWebpClass: 'html.without-webp',
      webpClass: 'html.has-webp',
      addNoJs: false
    }
  )
})

test('should replace passed class with html tag v2', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.without-webp .c { background-image: url(./image.png) }' +
      'body.has-webp .c { background-image: url(./image.webp) }',
    {
      noWebpClass: 'html .without-webp',
      webpClass: 'html .has-webp',
      addNoJs: false
    }
  )
})

test('set rename function', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.no-webp .c { background-image: url(./image.png) }' +
      'body.webp .c { background-image: url(./image.png.webp) }',
    {
      addNoJs: false,
      rename: oldName => {
        return oldName.replace(/\.(jpg|png)/gi, '.$1.webp')
      }
    }
  )
})

test('adds classes and WebP link when NoJs option is enabled', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
      'a, b { color: black; background: url(./image.jpg) } ' +
      'body.no-webp a, body.no-js a, body.no-webp b, body.no-js b { background-image: url(./image.jpg) } ' +
      'body.webp a, body.webp b { background-image: url(./image.webp) } ' +
      '}'
  )
})

test('should work with jpeg when NoJs option is enabled', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg) } }',
    '@media screen { ' +
      'a, b { color: black; background: url(./image.jpeg) } ' +
      'body.no-webp a, body.no-js a, body.no-webp b, body.no-js b { background-image: url(./image.jpeg) } ' +
      'body.webp a, body.webp b { background-image: url(./image.webp) } ' +
      '}'
  )
})

test('should skip urls with [&?]format=webp when NoJs option is enabled', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }',
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }'
  )
})

test('removes empty rule when NoJs option is enabled', () => {
  run(
    'a,b { background: url(./image.PNG) }',
    'a,b { background: url(./image.PNG) }' +
      'body.no-webp a, body.no-js a,body.no-webp b, body.no-js b { background-image: url(./image.PNG) }' +
      'body.webp a,body.webp b { background-image: url(./image.webp) }'
  )
})

test('does not duplicate html tag when NoJs option is enabled', () => {
  run(
    'html[lang=en] .icon { background: url(./image.jpg) }',
    'html[lang=en] .icon { background: url(./image.jpg) }' +
      'html[lang=en] body.no-webp .icon, html[lang=en] body.no-js .icon { background-image: url(./image.jpg) }' +
      'html[lang=en] body.webp .icon { background-image: url(./image.webp) }'
  )
})

test('should add :global() scope when css modules enabled', () => {
  run(
    'a { background: url(./image.png) }',
    'a { background: url(./image.png) }' +
      'body:global(.no-webp) a, body:global(.no-js) a { background-image: url(./image.png) }' +
      'body:global(.webp) a { background-image: url(./image.webp) }',
    { modules: true }
  )
})

test('should use passed classNames', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.without-webp .c, body.no-js .c { background-image: url(./image.png) }' +
      'body.has-webp .c { background-image: url(./image.webp) }',
    { noWebpClass: 'without-webp', webpClass: 'has-webp' }
  )
})

test('should replace passed class with html tag v1', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.without-webp .c, body.no-js .c { background-image: url(./image.png) }' +
      'body.has-webp .c { background-image: url(./image.webp) }',
    { noWebpClass: 'html.without-webp', webpClass: 'html.has-webp' }
  )
})

test('should replace passed class with html tag v2', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.without-webp .c, body.no-js .c { background-image: url(./image.png) }' +
      'body.has-webp .c { background-image: url(./image.webp) }',
    { noWebpClass: 'html .without-webp', webpClass: 'html .has-webp' }
  )
})

test('set rename function', () => {
  run(
    '.c { background: url(./image.png) }',
    '.c { background: url(./image.png) }' +
      'body.no-webp .c, body.no-js .c { background-image: url(./image.png) }' +
      'body.webp .c { background-image: url(./image.png.webp) }',
    {
      rename: oldName => {
        return oldName.replace(/\.(jpg|png)/gi, '.$1.webp')
      }
    }
  )
})

test.run()
