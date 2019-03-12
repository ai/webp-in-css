# WebP CSS

<img src="https://ai.github.io/webp-css/webp-logo.svg" align="right"
     alt="WebP logo" width="150" height="180">

PostCSS plugin and tiny JS script (128 B) to use WebP in CSS `background`.

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

<a href="https://evilmartians.com/?utm_source=webp-css">
  <img src="https://evilmartians.com/badges/sponsored-by-evil-martians.svg"
       alt="Sponsored by Evil Martians" width="236" height="54">
</a>


## WebP

WebP is a new image format to replace JPEG and PNG. It generates 30-50% smaller
images.

It is supported by Chrome, Firefox, and Edge. But you still need old
JPEG/PNG images for Safari.  In HTML you can use `<picture>` tag to use WebP
in modern browsers and JPEG/PNG in Safari. But for CSS `url()` you need
a more tricky way.
