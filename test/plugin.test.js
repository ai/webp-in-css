let postcss = require('postcss')

let plugin = require('../plugin')

function run(input, output, options) {
  expect(postcss([plugin(options)]).process(input).css).toBe(output)
}

it('adds classes and WebP link', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
      'a, b { color: black } ' +
      'body.no-webp a, body.no-webp b { background: url(./image.jpg) } ' +
      'body.webp a, body.webp b { background: url(./image.webp) } ' +
      '}',
    { addNoJs: false }
  )
})

it('should work with jpeg', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg) } }',
    '@media screen { ' +
      'a, b { color: black } ' +
      'body.no-webp a, body.no-webp b { background: url(./image.jpeg) } ' +
      'body.webp a, body.webp b { background: url(./image.webp) } ' +
      '}',
    { addNoJs: false }
  )
})

it('should skip urls with [&?]format=webp', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }',
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }',
    { addNoJs: false }
  )
})

it('removes empty rule', () => {
  run(
    'a,b { background: url(./image.PNG) }',
    'body.no-webp a,body.no-webp b { background: url(./image.PNG) }' +
      'body.webp a,body.webp b { background: url(./image.webp) }',
    { addNoJs: false }
  )
})

it('does not duplicate html tag', () => {
  run(
    'html[lang=en] .icon { background: url(./image.jpg) }',
    'html[lang=en] body.no-webp .icon { background: url(./image.jpg) }' +
      'html[lang=en] body.webp .icon { background: url(./image.webp) }',
    { addNoJs: false }
  )
})

describe('options', () => {
  it('should add :global() scope when css modules enabled', () => {
    run(
      'a { background: url(./image.png) }',
      'body:global(.no-webp) a { background: url(./image.png) }' +
        'body:global(.webp) a { background: url(./image.webp) }',
      { modules: true, addNoJs: false }
    )
  })

  it('should use passed classNames', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      { noWebpClass: 'without-webp', webpClass: 'has-webp', addNoJs: false }
    )
  })

  it('should replace passed class with html tag v1', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      {
        noWebpClass: 'html.without-webp',
        webpClass: 'html.has-webp',
        addNoJs: false
      }
    )
  })

  it('should replace passed class with html tag v2', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      {
        noWebpClass: 'html .without-webp',
        webpClass: 'html .has-webp',
        addNoJs: false
      }
    )
  })

  it('set rename function', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.no-webp .c { background: url(./image.png) }' +
        'body.webp .c { background: url(./image.png.webp) }',
      {
        addNoJs: false,
        rename: oldName => {
          return oldName.replace(/\.(jpg|png)/gi, '.$1.webp')
        }
      }
    )
  })
})

it('adds classes and WebP link when NoJs option is enabled', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpg) } }',
    '@media screen { ' +
      'a, b { color: black } ' +
      'body.no-webp a, body.no-js a, body.no-webp b, body.no-js b { background: url(./image.jpg) } ' +
      'body.webp a, body.webp b { background: url(./image.webp) } ' +
      '}'
  )
})

it('should work with jpeg when NoJs option is enabled', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg) } }',
    '@media screen { ' +
      'a, b { color: black } ' +
      'body.no-webp a, body.no-js a, body.no-webp b, body.no-js b { background: url(./image.jpeg) } ' +
      'body.webp a, body.webp b { background: url(./image.webp) } ' +
      '}'
  )
})

it('should skip urls with [&?]format=webp when NoJs option is enabled', () => {
  run(
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }',
    '@media screen { a, b { color: black; background: url(./image.jpeg?format=webp) } }'
  )
})

it('removes empty rule when NoJs option is enabled', () => {
  run(
    'a,b { background: url(./image.PNG) }',
    'body.no-webp a, body.no-js a,body.no-webp b, body.no-js b { background: url(./image.PNG) }' +
      'body.webp a,body.webp b { background: url(./image.webp) }'
  )
})

it('does not duplicate html tag when NoJs option is enabled', () => {
  run(
    'html[lang=en] .icon { background: url(./image.jpg) }',
    'html[lang=en] body.no-webp .icon, html[lang=en] body.no-js .icon { background: url(./image.jpg) }' +
      'html[lang=en] body.webp .icon { background: url(./image.webp) }'
  )
})

describe('options with enabled NoJs property', () => {
  it('should add :global() scope when css modules enabled', () => {
    run(
      'a { background: url(./image.png) }',
      'body:global(.no-webp) a, body:global(.no-js) a { background: url(./image.png) }' +
        'body:global(.webp) a { background: url(./image.webp) }',
      { modules: true }
    )
  })

  it('should use passed classNames', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c, body.no-js .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      { noWebpClass: 'without-webp', webpClass: 'has-webp' }
    )
  })

  it('should replace passed class with html tag v1', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c, body.no-js .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      { noWebpClass: 'html.without-webp', webpClass: 'html.has-webp' }
    )
  })

  it('should replace passed class with html tag v2', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.without-webp .c, body.no-js .c { background: url(./image.png) }' +
        'body.has-webp .c { background: url(./image.webp) }',
      { noWebpClass: 'html .without-webp', webpClass: 'html .has-webp' }
    )
  })

  it('set rename function', () => {
    run(
      '.c { background: url(./image.png) }',
      'body.no-webp .c, body.no-js .c { background: url(./image.png) }' +
        'body.webp .c { background: url(./image.png.webp) }',
      {
        rename: oldName => {
          return oldName.replace(/\.(jpg|png)/gi, '.$1.webp')
        }
      }
    )
  })
})
