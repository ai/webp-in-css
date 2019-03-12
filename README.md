# WebP CSS

<img src="https://ai.github.io/webp-css/webp-logo.svg" align="right"
     alt="WebP logo" width="150" height="180">

[PostCSS] plugin and tiny JS script (128 B) to use [WebP] in CSS `background`.

It will make your images [25% smaller] for Chrome, Firefox, and Edge.
Safari will download bigger JPEG/PNG image.

You add `require('webp-css')` to your JS bundle and write CSS like:

```css
.logo {
  width: 30px;
  height: 30px;
  background: url(/logo.png);
}
```

The script will set `webp` or `no-webp` class on `<body>`
and PostCSS plugin will generates:

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

<a href="https://evilmartians.com/?utm_source=webp-css">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## Usage

**Step 1:** Convert all your JPEG/PNG images to WebP by [Squoosh].
Set checkbox on `Lossless` for PNG images and remove it for JPEG.

We recommend `Reduce palette` for most of PNG images.

**Step 2:** Use `<picture>` to insert WebP images in HTML:

```html
<picture>
  <source src="/screenshot.webp" type="image/webp">
  <img src="/screenshot.jpg" alt="Screenshot">
</picture>
```

[Squoosh]: https://squoosh.app/
