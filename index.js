var webP = new Image()
webP.onload = webP.onerror = function () {
  document.body.classList.add(webP.height ? 'webp' : 'no-webp')
}
webP.src = 'data:image/webp;base64,' +
           'UklGRhoAAABXRUJQVlA4TA0AAAAvAAAAEAcQERGIiP4HAA=='
