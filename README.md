# WebP in CSS

<img src="https://ai.github.io/webp-in-css/webp-logo.svg" align="right"
     alt="WebP logo" width="150" height="180">

[PostCSS] plugin and tiny JS script (131 bytes) to use [WebP] in CSS `background`.

This tool will make your images [25% smaller] for Chrome, Firefox, and Edge.
Safari will download the bigger JPEG/PNG image.

You add `require('webp-in-css/polyfill')` to your JS bundle and write CSS like:

```css
.logo {
  width: 30px;
  height: 30px;
  background: url(/logo.png);
}
```

The script will set `webp` or `no-webp` class on `<body>`
and PostCSS plugin will generate:

```css
.logo {
  width: 30px;
  height: 30px;
}
body.webp .logo {
  background: url(/logo.webp);
}
body.no-webp .logo {
  background: url(/logo.png);
}
```

[25% smaller]: https://developers.google.com/speed/webp/docs/webp_lossless_alpha_study#results
[PostCSS]: https://github.com/postcss/postcss
[WebP]: https://en.wikipedia.org/wiki/WebP

<a href="https://evilmartians.com/?utm_source=webp-in-css">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Usage

**Step 1:** Install tool:

```sh
npm install --save-dev postcss webp-in-css
```

**Step 2:** convert all your JPEG/PNG images to WebP by [Squoosh].
Set checkbox on `Lossless` for PNG images and remove it for JPEG.

We recommend `Reduce palette` for most of the PNG images.

Save WebP images in the same places of JPEG/PNG images:
`img/bg.png` → `img/bg.webp`.

**Step 3:** use `<picture>` to insert WebP images in HTML:

```diff html
- <img src="/screenshot.jpg" alt="Screenshot">
+ <picture>
+   <source srcset="/screenshot.webp" type="image/webp">
+   <img src="/screenshot.jpg" alt="Screenshot">
+ </picture>
```

**Step 4:** install `webp-in-css`. For npm use:

```sh
npm install --save-dev webp-in-css
```

**Step 5:** add JS script to your client-side JS bundle:

```diff js
+ import 'webp-in-css/polyfill'
```

Since JS script is very small (131 bytes), the best way for landings
is to inline it to HTML:

```diff html
+   <script><%= readFile('node_modules/webp-in-css/polyfill.js') %></script>
  </head>
```

**Step 6:** check do you use PostCSS already in your bundler.
You can check `postcss.config.js` in the project root,
`"postcss"` section in `package.json` or `postcss` in bundle config.

If you don’t have it already, add PostCSS to your bundle:

* For webpack see [postcss-loader] docs.
* For Parcel create `postcss.config.js` file.
  It already has PostCSS support.
* For Gulp check [gulp-postcss] docs.

**Step 7:** Add `webp-in-css/plugin` to PostCSS plugins:

```diff js
module.exports = {
  plugins: [
+   require('webp-in-css/plugin'),
    require('autoprefixer')
  ]
}
```

If you use CSS Modules in webpack add `modules: true` option:

```diff js
module.exports = {
  plugins: [
-   require('webp-in-css/plugin'),
+   require('webp-in-css/plugin')({ modules: true }),
    require('autoprefixer')
  ]
}
```

We also recommend to put all images from CSS to preload content:

```diff html
+   <link rel="preload" as="image" type="image/webp" href="/logo.webp">
    <script><%= readFile('node_modules/webp-in-css/polyfill.js') %></script>
  </head>
```

[postcss-loader]: https://github.com/postcss/postcss-loader#usage
[gulp-postcss]: https://github.com/postcss/gulp-postcss
[Squoosh]: https://squoosh.app/


## PostCSS Options

```js
module.exports = {
  plugins: [
    require('webp-in-css/plugin')({ /* options */ }),
  ]
}
```

* `modules` boolean: wrap classes to `:global()` to support CSS Modules.
  `false` by default.
* `webpClass` string: class name for browser with WebP support.
* `noWebpClass` string: class name for browser without WebP support.
* `rename` function: get a new file name from old name, like `(oldName: string) => string`, then `url(./image.png)` → `url(./image.png.webp)`.
