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

test('set check function', () => {
  run(
    '.a { background: url(./image.png) }.b { background: url(./image.jpg) }',
    '.a { background: url(./image.png) }.b { background: url(./image.jpg) }' +
      'body.no-webp .b, body.no-js .b { background-image: url(./image.jpg) }' +
      'body.webp .b { background-image: url(./image.webp) }',
    {
      check: decl => decl.value.includes('.jpg')
    }
  )
})

test('adds classes and WebP link to body', () => {
  run(
    '@media screen { body, body.test, html body[data-test="1"], html body .test2 { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
      'body, body.test, html body[data-test="1"], html body .test2 { color: black; background: url(./image.jpg) } ' +
      'body.no-webp, body.no-webp.test, html body.no-webp[data-test="1"], html body.no-webp .test2 { background-image: url(./image.jpg) } ' +
      'body.webp, body.webp.test, html body.webp[data-test="1"], html body.webp .test2 { background-image: url(./image.webp) } ' +
      '}',
    { addNoJs: false }
  )
})

test('adds classes and WebP link, complex background', () => {
  run(
    '@media screen { a, b { color: black; background: url(\'./image().png\') 50% 50% / cover #FFF no-repeat; } }',
    '@media screen { ' +
      'a, b { color: black; background: url(\'./image().png\') 50% 50% / cover #FFF no-repeat; } ' +
      'body.no-webp a, body.no-webp b { background-image: url(\'./image().png\'); } ' +
      'body.webp a, body.webp b { background-image: url(\'./image().webp\'); } ' +
      '}',
    { addNoJs: false }
  )
})

test('adds classes and WebP link, image-set', () => {
  run(
    '@media screen { a, b { color: black; background: image-set(url("image.jpg") 1x, url("image.jpg") 2x) 50% 50% / cover #FFF no-repeat; } }',
    '@media screen { ' +
      'a, b { color: black; background: image-set(url("image.jpg") 1x, url("image.jpg") 2x) 50% 50% / cover #FFF no-repeat; } ' +
      'body.no-webp a, body.no-webp b { background-image: image-set(url("image.jpg") 1x, url("image.jpg") 2x); } ' +
      'body.webp a, body.webp b { background-image: image-set(url("image.webp") 1x, url("image.webp") 2x); } ' +
      '}',
    { addNoJs: false }
  )
})

test('adds classes and WebP link, image-set with type', () => {
  run(
    '@media screen { a, b { color: black; background: image-set(url("image.avif") type("image/avif"), url("image.jpg") type("image/jpeg")) 50% 50% / cover #FFF no-repeat; } }',
    '@media screen { ' +
      'a, b { color: black; background: image-set(url("image.avif") type("image/avif"), url("image.jpg") type("image/jpeg")) 50% 50% / cover #FFF no-repeat; } ' +
      '}',
    { addNoJs: false }
  )
})

test.run()
